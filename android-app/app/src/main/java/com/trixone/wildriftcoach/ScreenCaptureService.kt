package com.trixone.wildriftcoach

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.Image
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

class ScreenCaptureService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    private var windowManager: WindowManager? = null
    private var bubbleView: View? = null
    private var bubbleParams: WindowManager.LayoutParams? = null

    private var bubbleTextView: TextView? = null
    private val mainHandler by lazy { android.os.Handler(Looper.getMainLooper()) }

    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private val recognizer by lazy {
        TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    }

    @Volatile
    private var busy = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                startInForeground()
                startProjection(
                    intent.getIntExtra(EXTRA_RESULT_CODE, -1),
                    intent.getParcelableExtra(EXTRA_DATA)
                )
                showBubble()
            }

            ACTION_CAPTURE -> {
                if (!busy) {
                    busy = true
                    setBubbleMessage("Capturing...")
                    try {
                        val bitmap = captureOnce()
                        if (bitmap == null) {
                            Toast.makeText(this, "No frame available", Toast.LENGTH_SHORT).show()
                            setBubbleMessage("No frame")
                            busy = false
                            return START_STICKY
                        }

                        val input = InputImage.fromBitmap(bitmap, 0)
                        recognizer.process(input)
                            .addOnSuccessListener { visionText ->
                                val text = visionText.text.orEmpty().trim()
                                if (text.isBlank()) {
                                    setBubbleMessage("No text")
                                    return@addOnSuccessListener
                                }

                                setBubbleMessage("Thinking...")
                                AresCoachEngine(applicationContext).coachFromOcr(
                                    ocrText = text,
                                    onResult = { msg ->
                                        setBubbleMessage(msg)
                                    },
                                    onError = { err ->
                                        setBubbleMessage("Backend error: $err")
                                    }
                                )
                            }
                            .addOnFailureListener { e ->
                                Toast.makeText(this, "OCR failed: ${e.message}", Toast.LENGTH_SHORT).show()
                                setBubbleMessage("OCR failed")
                            }
                            .addOnCompleteListener {
                                busy = false
                            }
                    } catch (e: Exception) {
                        busy = false
                        Toast.makeText(this, "Capture failed: ${e.message}", Toast.LENGTH_SHORT).show()
                        setBubbleMessage("Capture failed")
                    }
                }
            }

            ACTION_STOP -> {
                hideBubble()
                stopProjection()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }

            else -> {
                startInForeground()
                showBubble()
            }
        }
        return START_STICKY
    }

    private fun startInForeground() {
        val channelId = NOTIFICATION_CHANNEL_ID
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Screen Capture",
                NotificationManager.IMPORTANCE_LOW
            )
            nm.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Screen capture ready")
            .setContentText("Foreground service running")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    private fun startProjection(resultCode: Int, data: Intent?) {
        if (mediaProjection != null) {
            return
        }

        if (resultCode != android.app.Activity.RESULT_OK || data == null) {
            return
        }

        val mgr = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        val mp = mgr.getMediaProjection(resultCode, data)
        mediaProjection = mp

        val metrics = resources.displayMetrics
        val width = metrics.widthPixels
        val height = metrics.heightPixels
        val density = metrics.densityDpi

        imageReader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
        virtualDisplay = mp.createVirtualDisplay(
            "WildRiftOcr",
            width,
            height,
            density,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            imageReader!!.surface,
            null,
            null
        )
    }

    private fun captureOnce(): Bitmap? {
        val reader = imageReader ?: return null

        var image: Image? = null
        repeat(6) {
            image = reader.acquireLatestImage()
            if (image != null) return@repeat
            SystemClock.sleep(40)
        }

        val img = image ?: return null
        img.use {
            val plane = it.planes[0]
            val buffer = plane.buffer
            val pixelStride = plane.pixelStride
            val rowStride = plane.rowStride
            val rowPadding = rowStride - pixelStride * it.width

            val padded = Bitmap.createBitmap(
                it.width + rowPadding / pixelStride,
                it.height,
                Bitmap.Config.ARGB_8888
            )
            padded.copyPixelsFromBuffer(buffer)
            return Bitmap.createBitmap(padded, 0, 0, it.width, it.height)
        }
    }

    private fun stopProjection() {
        try {
            virtualDisplay?.release()
        } catch (_: Exception) {
        }
        virtualDisplay = null

        try {
            imageReader?.close()
        } catch (_: Exception) {
        }
        imageReader = null

        try {
            mediaProjection?.stop()
        } catch (_: Exception) {
        }
        mediaProjection = null
    }

    private fun showBubble() {
        if (!Settings.canDrawOverlays(this)) {
            return
        }

        if (bubbleView != null) {
            return
        }

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.argb(220, 20, 20, 20))
            setPadding(24, 24, 24, 24)
        }

        val button = ImageButton(this).apply {
            setImageResource(android.R.drawable.ic_menu_search)
            contentDescription = "OCR"
            setBackgroundColor(Color.TRANSPARENT)
            setOnClickListener {
                startService(Intent(this@ScreenCaptureService, ScreenCaptureService::class.java).apply {
                    action = ACTION_CAPTURE
                })
            }
        }

        val tv = TextView(this).apply {
            setTextColor(Color.WHITE)
            textSize = 12f
            text = "Tap to OCR"
            setPadding(0, 16, 0, 0)
        }
        bubbleTextView = tv

        container.addView(button)
        container.addView(tv)

        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

        bubbleParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 20
            y = 200
        }

        container.setOnTouchListener(DragTouchListener())
        bubbleView = container

        try {
            windowManager?.addView(bubbleView, bubbleParams)
        } catch (_: Exception) {
            bubbleView = null
        }
    }

    private fun setBubbleMessage(message: String) {
        val msg = message.take(240)
        mainHandler.post {
            bubbleTextView?.text = msg
        }
    }

    private fun hideBubble() {
        val wm = windowManager
        val view = bubbleView
        if (wm != null && view != null) {
            try {
                wm.removeView(view)
            } catch (_: Exception) {
            }
        }
        bubbleView = null
        bubbleParams = null
        bubbleTextView = null
        windowManager = null
    }

    private inner class DragTouchListener : View.OnTouchListener {
        private var initialX = 0
        private var initialY = 0
        private var initialTouchX = 0f
        private var initialTouchY = 0f

        override fun onTouch(v: View, event: MotionEvent): Boolean {
            val params = bubbleParams ?: return false
            val wm = windowManager ?: return false

            return when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    false
                }

                MotionEvent.ACTION_MOVE -> {
                    params.x = initialX + (event.rawX - initialTouchX).toInt()
                    params.y = initialY + (event.rawY - initialTouchY).toInt()
                    try {
                        wm.updateViewLayout(v, params)
                    } catch (_: Exception) {
                    }
                    true
                }

                else -> false
            }
        }
    }

    override fun onDestroy() {
        hideBubble()
        stopProjection()
        recognizer.close()
        super.onDestroy()
    }

    companion object {
        private const val NOTIFICATION_ID = 1
        private const val NOTIFICATION_CHANNEL_ID = "screen_capture"

        const val ACTION_START = "screen_capture.START"
        const val ACTION_CAPTURE = "screen_capture.CAPTURE"
        const val ACTION_STOP = "screen_capture.STOP"

        const val EXTRA_RESULT_CODE = "extra_result_code"
        const val EXTRA_DATA = "extra_data"
    }
}
