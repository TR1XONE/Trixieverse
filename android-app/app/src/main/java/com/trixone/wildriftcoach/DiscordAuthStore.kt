package com.trixone.wildriftcoach

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class DiscordAuthStore(private val context: Context) {

    private val masterKey by lazy {
        MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
    }

    private val prefs by lazy {
        EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun savePkce(verifier: String, state: String) {
        prefs.edit()
            .putString(KEY_PKCE_VERIFIER, verifier)
            .putString(KEY_OAUTH_STATE, state)
            .apply()
    }

    fun readPkceVerifier(): String? = prefs.getString(KEY_PKCE_VERIFIER, null)
    fun readState(): String? = prefs.getString(KEY_OAUTH_STATE, null)

    fun clearPkce() {
        prefs.edit()
            .remove(KEY_PKCE_VERIFIER)
            .remove(KEY_OAUTH_STATE)
            .apply()
    }

    fun saveSession(
        accessToken: String,
        tokenType: String,
        expiresInSec: Long,
        refreshToken: String?,
        scope: String?,
        discordUserId: String,
        username: String,
        globalName: String?,
        avatar: String?
    ) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_TOKEN_TYPE, tokenType)
            .putLong(KEY_EXPIRES_IN, expiresInSec)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .putString(KEY_SCOPE, scope)
            .putString(KEY_DISCORD_USER_ID, discordUserId)
            .putString(KEY_USERNAME, username)
            .putString(KEY_GLOBAL_NAME, globalName)
            .putString(KEY_AVATAR, avatar)
            .apply()
    }

    fun isLoggedIn(): Boolean {
        val id = prefs.getString(KEY_DISCORD_USER_ID, null)
        val token = prefs.getString(KEY_ACCESS_TOKEN, null)
        return !id.isNullOrBlank() && !token.isNullOrBlank()
    }

    fun getDiscordUserId(): String? = prefs.getString(KEY_DISCORD_USER_ID, null)
    fun getDisplayName(): String? {
        val gn = prefs.getString(KEY_GLOBAL_NAME, null)
        return if (!gn.isNullOrBlank()) gn else prefs.getString(KEY_USERNAME, null)
    }

    fun getAccessToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)

    fun logout() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val PREFS_NAME = "discord_auth"

        private const val KEY_PKCE_VERIFIER = "pkce_verifier"
        private const val KEY_OAUTH_STATE = "oauth_state"

        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_TOKEN_TYPE = "token_type"
        private const val KEY_EXPIRES_IN = "expires_in"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_SCOPE = "scope"

        private const val KEY_DISCORD_USER_ID = "discord_user_id"
        private const val KEY_USERNAME = "username"
        private const val KEY_GLOBAL_NAME = "global_name"
        private const val KEY_AVATAR = "avatar"
    }
}
