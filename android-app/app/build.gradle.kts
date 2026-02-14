import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.trixone.wildriftcoach"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.trixone.wildriftcoach"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "0.1.0"

        val localProps = Properties().apply {
            val f = rootProject.file("local.properties")
            if (f.exists()) {
                f.inputStream().use { load(it) }
            }
        }

        val discordClientId =
            (project.findProperty("DISCORD_CLIENT_ID") as String?)
                ?: System.getenv("DISCORD_CLIENT_ID")
                ?: ""

        val openAiApiKey =
            localProps.getProperty("OPENAI_API_KEY")
                ?: (project.findProperty("OPENAI_API_KEY") as String?)
                ?: System.getenv("OPENAI_API_KEY")
                ?: ""

        buildConfigField(
            "String",
            "DISCORD_CLIENT_ID",
            "\"" + discordClientId + "\""
        )

        buildConfigField(
            "String",
            "OPENAI_API_KEY",
            "\"" + openAiApiKey + "\""
        )
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.browser)
    implementation(libs.androidx.security.crypto)
    implementation(libs.material)

    implementation(libs.mlkit.text.recognition)

    implementation(libs.okhttp)
}
