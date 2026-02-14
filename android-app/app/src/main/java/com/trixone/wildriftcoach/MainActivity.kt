package com.trixone.wildriftcoach

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private val projectionManager by lazy {
        getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
    }

    private val projectionLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { res ->
            if (res.resultCode == Activity.RESULT_OK && res.data != null) {
                val intent = Intent(this, ScreenCaptureService::class.java).apply {
                    action = ScreenCaptureService.ACTION_START
                    putExtra(ScreenCaptureService.EXTRA_RESULT_CODE, res.resultCode)
                    putExtra(ScreenCaptureService.EXTRA_DATA, res.data)
                }
                ContextCompat.startForegroundService(this, intent)
                Toast.makeText(this, "Service started. Bubble should appear.", Toast.LENGTH_SHORT).show()
                refreshBlueprintCard()
            } else {
                Toast.makeText(this, "Screen capture permission denied", Toast.LENGTH_SHORT).show()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val discordStore = DiscordAuthStore(applicationContext)

        if (Build.VERSION.SDK_INT >= 33) {
            requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 100)
        }

        val tvDiscordStatus = findViewById<TextView>(R.id.tvDiscordStatus)
        val btnDiscordLogin = findViewById<Button>(R.id.btnDiscordLogin)
        val btnDiscordLogout = findViewById<Button>(R.id.btnDiscordLogout)

        fun refreshDiscordStatus() {
            if (discordStore.isLoggedIn()) {
                tvDiscordStatus.text = "Discord: ${discordStore.getDisplayName()} (${discordStore.getDiscordUserId()})"
                btnDiscordLogout.isEnabled = true
            } else {
                tvDiscordStatus.text = "Discord: Not logged in"
                btnDiscordLogout.isEnabled = false
            }
        }

        refreshDiscordStatus()
        refreshBlueprintCard()

        btnDiscordLogin.setOnClickListener {
            val clientId = BuildConfig.DISCORD_CLIENT_ID
            if (clientId.isBlank()) {
                Toast.makeText(this, "DISCORD_CLIENT_ID is not set (see app/build.gradle.kts)", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            DiscordAuthManager(this, clientId).startLogin()
        }

        btnDiscordLogout.setOnClickListener {
            discordStore.logout()
            refreshDiscordStatus()
            refreshBlueprintCard()
        }

        val etBackendIp = findViewById<EditText>(R.id.etBackendIp)
        val btnSaveBackendIp = findViewById<Button>(R.id.btnSaveBackendIp)
        etBackendIp.setText(prefs.getString(KEY_BACKEND_IP, "") ?: "")
        btnSaveBackendIp.setOnClickListener {
            val ip = etBackendIp.text?.toString()?.trim().orEmpty()
            prefs.edit().putString(KEY_BACKEND_IP, ip).apply()
            Toast.makeText(this, "Saved backend IP: $ip", Toast.LENGTH_SHORT).show()
        }

        val btnStart = findViewById<Button>(R.id.btnStart)
        val btnStop = findViewById<Button>(R.id.btnStop)

        btnStart.setOnClickListener {
            if (!Settings.canDrawOverlays(this)) {
                requestOverlayPermission()
                return@setOnClickListener
            }

            val captureIntent = projectionManager.createScreenCaptureIntent()
            projectionLauncher.launch(captureIntent)
        }

        btnStop.setOnClickListener {
            startService(Intent(this, ScreenCaptureService::class.java).apply {
                action = ScreenCaptureService.ACTION_STOP
            })
        }
    }

    override fun onResume() {
        super.onResume()
        val discordStore = DiscordAuthStore(applicationContext)
        val tvDiscordStatus = findViewById<TextView>(R.id.tvDiscordStatus)
        val btnDiscordLogout = findViewById<Button>(R.id.btnDiscordLogout)
        if (discordStore.isLoggedIn()) {
            tvDiscordStatus.text = "Discord: ${discordStore.getDisplayName()} (${discordStore.getDiscordUserId()})"
            btnDiscordLogout.isEnabled = true
        } else {
            tvDiscordStatus.text = "Discord: Not logged in"
            btnDiscordLogout.isEnabled = false
        }

        refreshBlueprintCard()
    }

    private fun refreshBlueprintCard() {
        val tvBlueprintSummary = findViewById<TextView>(R.id.tvBlueprintSummary)
        val tvBlueprintNextMove = findViewById<TextView>(R.id.tvBlueprintNextMove)
        val tvBlueprintDelta = findViewById<TextView>(R.id.tvBlueprintDelta)

        val discordUserId = DiscordAuthStore(applicationContext).getDiscordUserId()
        val snap = AresIntelligenceModule(applicationContext).getLatestBlueprintSnapshot(discordUserId)

        if (snap == null) {
            tvBlueprintSummary.text = if (discordUserId.isNullOrBlank()) {
                "Log in with Discord to start tracking Blueprint snapshots."
            } else {
                "No blueprint snapshots yet. Capture a frame to generate one."
            }
            tvBlueprintNextMove.text = ""
            tvBlueprintDelta.text = ""
            return
        }

        tvBlueprintSummary.text = snap.summary
        tvBlueprintNextMove.text = "Next move: ${snap.nextMove}"
        val pct = (snap.winProbabilityDelta * 100.0)
        tvBlueprintDelta.text = "Win Δ: ${String.format("%.1f", pct)}% (${snap.tier})"
    }

    private fun requestOverlayPermission() {
        Toast.makeText(this, "Enable overlay permission to show the bubble", Toast.LENGTH_LONG).show()
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:$packageName")
        )
        startActivity(intent)
    }

    companion object {
        const val PREFS_NAME = "ares_prefs"
        const val KEY_BACKEND_IP = "backend_ip"
    }
}
