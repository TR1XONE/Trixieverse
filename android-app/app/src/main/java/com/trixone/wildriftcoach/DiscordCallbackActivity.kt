package com.trixone.wildriftcoach

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import okhttp3.OkHttpClient
import kotlin.concurrent.thread

class DiscordCallbackActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val data: Uri? = intent?.data
        if (data == null) {
            finishToMain("Missing callback data")
            return
        }

        val code = data.getQueryParameter("code")
        val state = data.getQueryParameter("state")
        if (code.isNullOrBlank() || state.isNullOrBlank()) {
            finishToMain("Missing code/state")
            return
        }

        val store = DiscordAuthStore(applicationContext)
        val expectedState = store.readState()
        if (expectedState.isNullOrBlank() || expectedState != state) {
            store.clearPkce()
            finishToMain("Invalid state")
            return
        }

        val verifier = store.readPkceVerifier()
        if (verifier.isNullOrBlank()) {
            finishToMain("Missing PKCE verifier")
            return
        }

        val clientId = BuildConfig.DISCORD_CLIENT_ID
        if (clientId.isBlank()) {
            finishToMain("Missing DISCORD_CLIENT_ID")
            return
        }

        thread {
            try {
                val oauth = DiscordOAuthClient(OkHttpClient())
                val token = oauth.exchangeCodeForToken(
                    clientId = clientId,
                    redirectUri = DiscordAuthManager.REDIRECT_URI,
                    code = code,
                    codeVerifier = verifier
                )

                val user = oauth.fetchDiscordUser(token.accessToken)
                val avatarUrl = oauth.buildAvatarUrl(user.id, user.avatar)

                store.saveSession(
                    accessToken = token.accessToken,
                    tokenType = token.tokenType,
                    expiresInSec = token.expiresIn,
                    refreshToken = token.refreshToken,
                    scope = token.scope,
                    discordUserId = user.id,
                    username = user.username,
                    globalName = user.globalName,
                    avatar = avatarUrl
                )
                store.clearPkce()

                runOnUiThread {
                    Toast.makeText(this, "Logged in as ${store.getDisplayName()}", Toast.LENGTH_SHORT).show()
                    finishToMain(null)
                }
            } catch (e: Exception) {
                store.clearPkce()
                runOnUiThread {
                    finishToMain(e.message ?: "Login failed")
                }
            }
        }
    }

    private fun finishToMain(error: String?) {
        if (!error.isNullOrBlank()) {
            Toast.makeText(this, error, Toast.LENGTH_LONG).show()
        }
        val intent = Intent(this, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        startActivity(intent)
        finish()
    }
}
