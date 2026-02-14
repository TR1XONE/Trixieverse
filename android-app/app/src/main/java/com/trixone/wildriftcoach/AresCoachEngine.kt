package com.trixone.wildriftcoach

import android.content.Context
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class AresCoachEngine(private val context: Context) {

    private val client = OkHttpClient()

    fun coachFromOcr(
        ocrText: String,
        onResult: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        val discordUserId = DiscordAuthStore(context).getDiscordUserId()
        val local = AresIntelligenceModule(context).coachFromOcr(
            discordUserId = discordUserId,
            ocrText = ocrText,
        )

        val blueprintNextMove = ((local.predictions["blueprint"] as? Map<*, *>)?.get("next_move") as? String)
            ?.trim()
            .orEmpty()

        val localWithBlueprint = if (blueprintNextMove.isNotBlank()) {
            "${local.message}\n\nBlueprint Next Move: $blueprintNextMove"
        } else {
            local.message
        }

        val ip = context
            .getSharedPreferences(MainActivity.PREFS_NAME, Context.MODE_PRIVATE)
            .getString(MainActivity.KEY_BACKEND_IP, "")
            ?.trim()
            .orEmpty()

        if (ip.isBlank()) {
            onResult(localWithBlueprint)
            return
        }

        val url = "http://$ip:8000/api/ares/coach"

        val bodyJson = JSONObject()
            .put("ocr_text", ocrText)
            .put("discord_user_id", discordUserId)

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val req = Request.Builder()
            .url(url)
            .post(bodyJson.toString().toRequestBody(mediaType))
            .build()

        client.newCall(req).enqueue(
            object : okhttp3.Callback {
                override fun onFailure(call: okhttp3.Call, e: java.io.IOException) {
                    onResult(localWithBlueprint)
                }

                override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                    response.use {
                        if (!it.isSuccessful) {
                            onResult(localWithBlueprint)
                            return
                        }

                        val raw = it.body?.string().orEmpty()
                        try {
                            val msg = JSONObject(raw).optString("message")
                            if (msg.isBlank()) {
                                onResult(localWithBlueprint)
                            } else {
                                val combined = if (blueprintNextMove.isNotBlank()) {
                                    "$msg\n\nBlueprint Next Move: $blueprintNextMove"
                                } else {
                                    msg
                                }
                                onResult(combined)
                            }
                        } catch (t: Throwable) {
                            onResult(localWithBlueprint)
                        }
                    }
                }
            }
        )
    }
}
