package com.trixone.wildriftcoach

import android.net.Uri
import android.util.Base64
import okhttp3.FormBody
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.security.MessageDigest
import java.security.SecureRandom

class DiscordOAuthClient(
    private val okHttpClient: OkHttpClient = OkHttpClient()
) {

    data class Pkce(
        val verifier: String,
        val challenge: String
    )

    data class TokenResponse(
        val accessToken: String,
        val tokenType: String,
        val expiresIn: Long,
        val refreshToken: String?,
        val scope: String?
    )

    data class DiscordUser(
        val id: String,
        val username: String,
        val globalName: String?,
        val avatar: String?
    )

    fun generatePkce(): Pkce {
        val bytes = ByteArray(32)
        SecureRandom().nextBytes(bytes)
        val verifier = Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)

        val digest = MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray(Charsets.US_ASCII))
        val challenge = Base64.encodeToString(digest, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)

        return Pkce(verifier = verifier, challenge = challenge)
    }

    fun generateState(): String {
        val bytes = ByteArray(16)
        SecureRandom().nextBytes(bytes)
        return Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
    }

    fun buildAuthorizeUri(
        clientId: String,
        redirectUri: String,
        scope: String,
        state: String,
        codeChallenge: String
    ): Uri {
        return Uri.parse("https://discord.com/api/oauth2/authorize").buildUpon()
            .appendQueryParameter("client_id", clientId)
            .appendQueryParameter("redirect_uri", redirectUri)
            .appendQueryParameter("response_type", "code")
            .appendQueryParameter("scope", scope)
            .appendQueryParameter("state", state)
            .appendQueryParameter("code_challenge", codeChallenge)
            .appendQueryParameter("code_challenge_method", "S256")
            .build()
    }

    @Throws(Exception::class)
    fun exchangeCodeForToken(
        clientId: String,
        redirectUri: String,
        code: String,
        codeVerifier: String
    ): TokenResponse {
        val body = FormBody.Builder()
            .add("client_id", clientId)
            .add("grant_type", "authorization_code")
            .add("code", code)
            .add("redirect_uri", redirectUri)
            .add("code_verifier", codeVerifier)
            .build()

        val req = Request.Builder()
            .url("https://discord.com/api/oauth2/token")
            .post(body)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("Accept", "application/json")
            .build()

        okHttpClient.newCall(req).execute().use { res ->
            val raw = res.body?.string().orEmpty()
            if (!res.isSuccessful) {
                throw IllegalStateException("Token exchange failed: HTTP ${res.code} $raw")
            }

            val json = JSONObject(raw)
            return TokenResponse(
                accessToken = json.getString("access_token"),
                tokenType = json.optString("token_type", "Bearer"),
                expiresIn = json.optLong("expires_in", 0L),
                refreshToken = json.optString("refresh_token").takeIf { it.isNotBlank() },
                scope = json.optString("scope").takeIf { it.isNotBlank() }
            )
        }
    }

    @Throws(Exception::class)
    fun fetchDiscordUser(accessToken: String): DiscordUser {
        val req = Request.Builder()
            .url("https://discord.com/api/users/@me")
            .get()
            .header("Authorization", "Bearer $accessToken")
            .header("Accept", "application/json")
            .build()

        okHttpClient.newCall(req).execute().use { res ->
            val raw = res.body?.string().orEmpty()
            if (!res.isSuccessful) {
                throw IllegalStateException("Fetch user failed: HTTP ${res.code} $raw")
            }

            val json = JSONObject(raw)
            return DiscordUser(
                id = json.getString("id"),
                username = json.optString("username", "discord_user"),
                globalName = json.optString("global_name").takeIf { it.isNotBlank() },
                avatar = json.optString("avatar").takeIf { it.isNotBlank() }
            )
        }
    }

    fun buildAvatarUrl(userId: String, avatarHash: String?): String? {
        if (avatarHash.isNullOrBlank()) return null
        return "https://cdn.discordapp.com/avatars/$userId/$avatarHash.png"
    }
}
