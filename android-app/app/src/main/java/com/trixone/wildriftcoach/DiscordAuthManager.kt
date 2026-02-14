package com.trixone.wildriftcoach

import android.content.Context
import androidx.browser.customtabs.CustomTabsIntent
import okhttp3.OkHttpClient

class DiscordAuthManager(
    private val context: Context,
    private val clientId: String,
    private val redirectUri: String = REDIRECT_URI,
    private val scope: String = "identify",
) {

    private val store = DiscordAuthStore(context)
    private val oauth = DiscordOAuthClient(OkHttpClient())

    fun startLogin() {
        val pkce = oauth.generatePkce()
        val state = oauth.generateState()
        store.savePkce(pkce.verifier, state)

        val uri = oauth.buildAuthorizeUri(
            clientId = clientId,
            redirectUri = redirectUri,
            scope = scope,
            state = state,
            codeChallenge = pkce.challenge
        )

        val customTabsIntent = CustomTabsIntent.Builder().build()
        customTabsIntent.launchUrl(context, uri)
    }

    companion object {
        const val REDIRECT_URI = "trixieverse://oauth/discord"
    }
}
