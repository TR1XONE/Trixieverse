package com.trixone.wildriftcoach

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import org.json.JSONArray
import org.json.JSONObject

class AresIntelligenceModule(private val context: Context) {

    data class SkillRadar5D(
        val mechanics: Int,
        val macro: Int,
        val decisionMaking: Int,
        val consistency: Int,
        val clutch: Int,
    ) {
        fun toJson(): JSONObject = JSONObject()
            .put("mechanics", mechanics)
            .put("macro", macro)
            .put("decisionMaking", decisionMaking)
            .put("consistency", consistency)
            .put("clutch", clutch)

        companion object {
            fun default(): SkillRadar5D = SkillRadar5D(
                mechanics = 50,
                macro = 50,
                decisionMaking = 50,
                consistency = 50,
                clutch = 50,
            )

            fun fromJson(raw: String?): SkillRadar5D {
                if (raw.isNullOrBlank()) return default()
                return try {
                    val obj = JSONObject(raw)
                    SkillRadar5D(
                        mechanics = obj.optInt("mechanics", 50).coerceIn(0, 100),
                        macro = obj.optInt("macro", 50).coerceIn(0, 100),
                        decisionMaking = obj.optInt("decisionMaking", 50).coerceIn(0, 100),
                        consistency = obj.optInt("consistency", 50).coerceIn(0, 100),
                        clutch = obj.optInt("clutch", 50).coerceIn(0, 100),
                    )
                } catch (_: Throwable) {
                    default()
                }
            }
        }
    }

    enum class RelationshipStage {
        STRANGER,
        ACQUAINTANCE,
        FRIEND,
        BEST_FRIEND,
        LEGEND,
    }

    enum class AdviceTone {
        SUPPORTIVE,
        CALMING,
        DIRECT,
        HYPE,
    }

    enum class MemoryMomentType {
        EPIC_PLAY,
        CLUTCH,
        TERRIBLE_MISTAKE,
        FUNNY,
        LEARNING,
    }

    data class ObjectiveRisk(
        val present: Boolean,
        val probability: Double,
        val objectiveHint: String,
        val reason: String,
    )

    data class CoachOutput(
        val message: String,
        val stage: RelationshipStage,
        val tone: AdviceTone,
        val skillRadar: SkillRadar5D,
        val recurringThemes: List<String>,
        val predictions: Map<String, Any>,
    )

    data class BlueprintInsight(
        val tier: String,
        val gpmRatio: Double?,
        val kdaRatio: Double?,
        val winProbabilityDelta: Double,
        val summary: String,
        val nextMove: String,
    )

    data class BlueprintSnapshot(
        val createdAtMs: Long,
        val tier: String,
        val summary: String,
        val nextMove: String,
        val winProbabilityDelta: Double,
    )

    private data class TrendThresholds(
        val deathSpikeStartMin: Int,
        val deathSpikeEndMin: Int,
        val deathSpikeShareThreshold: Double,
    )

    private data class ObjectiveRiskThresholds(
        val windowsMinutes: Map<String, IntRange>,
        val goldDiff: ThresholdTripletInt,
        val goldTrendPerMin: ThresholdTripletDouble,
        val risk: RiskProbabilities,
    )

    private data class ThresholdTripletInt(
        val low: Int,
        val medium: Int,
        val high: Int,
    )

    private data class ThresholdTripletDouble(
        val low: Double,
        val medium: Double,
        val high: Double,
    )

    private data class RiskProbabilities(
        val baseWhenBehind: Double,
        val low: Double,
        val medium: Double,
        val high: Double,
        val cap: Double,
        val objectiveCalloutBonus: Double,
        val shutdownBonus: Double,
        val aceOrWipeBonus: Double,
        val stolenBonus: Double,
    )

    private val db by lazy { AresDb(context.applicationContext) }
    @Suppress("unused")
    private val thresholds by lazy { loadTrendThresholds() }
    private val objectiveRiskThresholds by lazy { loadObjectiveRiskThresholds() }
    private val blueprintService by lazy { BlueprintService(context.applicationContext) }

    fun coachFromOcr(
        discordUserId: String?,
        ocrText: String,
    ): CoachOutput {
        val trimmed = ocrText.trim()
        if (discordUserId.isNullOrBlank()) {
            return CoachOutput(
                message = "I can coach better if you log in with Discord first. Open the app and connect your Discord.",
                stage = RelationshipStage.STRANGER,
                tone = AdviceTone.SUPPORTIVE,
                skillRadar = SkillRadar5D.default(),
                recurringThemes = emptyList(),
                predictions = emptyMap(),
            )
        }

        val profile = db.loadOrCreateProfile(discordUserId)

        val extracted = extractSignalsFromOcr(trimmed)
        val themesNow = extractThemes(extracted)

        val updatedRecurring = incrementThemes(profile.recurringThemes, themesNow)

        val updatedInteractions = profile.interactions + 1
        val stage = computeStage(updatedInteractions)

        val updatedRadar = updateSkillRadar(profile.skillRadar, extracted, updatedRecurring)

        val tone = computeTone(
            stage = stage,
            extracted = extracted,
            recurringThemes = topRecurringThemes(updatedRecurring),
        )

        val prediction = predictObjectiveRisk(extracted)

        val blueprint = blueprintService.generateInsight(
            minute = extracted.minute,
            goldDiff = extracted.goldDiff,
            goldTrendPerMin = extracted.goldTrendPerMin,
            gpm = extracted.gpm,
            kills = extracted.kills,
            deaths = extracted.deaths,
            assists = extracted.assists,
            objectiveMentions = extracted.objectiveMentions,
            objectiveRisk = prediction,
        )

        val message = buildMessage(
            stage = stage,
            tone = tone,
            ocrText = trimmed,
            extracted = extracted,
            recurringThemes = topRecurringThemes(updatedRecurring),
            objectiveRisk = prediction,
        )

        val now = System.currentTimeMillis()
        db.saveProfile(
            discordUserId = discordUserId,
            interactions = updatedInteractions,
            lastSeenAtMs = now,
            stage = stage,
            skillRadar = updatedRadar,
            recurringThemes = updatedRecurring,
        )

        db.insertAdviceHistory(
            discordUserId = discordUserId,
            message = message,
            themes = themesNow,
            ocrExcerpt = trimmed.take(220),
            createdAtMs = now,
        )

        if (blueprint != null) {
            db.insertBlueprintSnapshot(
                discordUserId = discordUserId,
                createdAtMs = now,
                minute = extracted.minute,
                goldDiff = extracted.goldDiff,
                goldTrendPerMin = extracted.goldTrendPerMin,
                gpm = extracted.gpm,
                kills = extracted.kills,
                deaths = extracted.deaths,
                assists = extracted.assists,
                winProbabilityDelta = blueprint.winProbabilityDelta,
                tier = blueprint.tier,
                insightSummary = blueprint.summary,
                nextMove = blueprint.nextMove,
            )
        }

        val memoryMoment = inferMemoryMoment(extracted, trimmed)
        if (memoryMoment != null) {
            db.insertMemoryMoment(
                discordUserId = discordUserId,
                type = memoryMoment.first,
                text = memoryMoment.second,
                tags = themesNow,
                createdAtMs = now,
            )
        }

        val outPredictions: MutableMap<String, Any> = mutableMapOf(
            "objective_risk" to mapOf(
                "present" to prediction.present,
                "probability" to prediction.probability,
                "objective_hint" to prediction.objectiveHint,
                "reason" to prediction.reason,
            )
        )

        extracted.goldDiff?.let { outPredictions["gold_diff"] = it }
        extracted.goldTrendPerMin?.let { outPredictions["gold_trend_per_min"] = it }
        extracted.minute?.let { outPredictions["minute"] = it }
        extracted.gpm?.let { outPredictions["gpm"] = it }
        extracted.kills?.let { outPredictions["kills"] = it }
        extracted.deaths?.let { outPredictions["deaths"] = it }
        extracted.assists?.let { outPredictions["assists"] = it }
        outPredictions["shutdown"] = extracted.shutdownMentioned
        outPredictions["shutdown_gold"] = extracted.shutdownGoldMentioned
        outPredictions["ace_or_wipe"] = extracted.aceOrWipeMentioned
        outPredictions["stolen"] = extracted.stolenMentioned
        outPredictions["multi_kill"] = extracted.multiKillTier.name
        outPredictions["objectives"] = extracted.objectiveMentions.map { it.name }

        if (blueprint != null) {
            outPredictions["blueprint"] = mapOf(
                "tier" to blueprint.tier,
                "gpm_ratio" to blueprint.gpmRatio,
                "kda_ratio" to blueprint.kdaRatio,
                "win_probability_delta" to blueprint.winProbabilityDelta,
                "summary" to blueprint.summary,
                "next_move" to blueprint.nextMove,
            )
        }

        return CoachOutput(
            message = message,
            stage = stage,
            tone = tone,
            skillRadar = updatedRadar,
            recurringThemes = topRecurringThemes(updatedRecurring),
            predictions = outPredictions,
        )
    }

    private data class ExtractedSignals(
        val goldDiff: Int?,
        val goldTrendPerMin: Double?,
        val minute: Int?,
        val gpm: Int?,
        val kills: Int?,
        val deaths: Int?,
        val assists: Int?,
        val objectiveMentions: Set<ObjectiveMention>,
        val shutdownMentioned: Boolean,
        val shutdownGoldMentioned: Boolean,
        val aceOrWipeMentioned: Boolean,
        val stolenMentioned: Boolean,
        val multiKillTier: MultiKillTier,
        val deathSpikePresent: Boolean,
        val deathSpikeReason: String,
    )

    private enum class MultiKillTier {
        NONE,
        DOUBLE,
        TRIPLE,
        QUADRA,
        PENTA,
    }

    private enum class ObjectiveMention {
        DRAGON,
        ELDER,
        BARON,
        HERALD,
        TURRET,
        INHIB,
        NEXUS,
    }

    private fun extractSignalsFromOcr(ocrText: String): ExtractedSignals {
        val goldDiff = extractGoldDiff(ocrText)
        val goldTrend = extractGoldTrendPerMinute(ocrText)

        val minute = extractMinute(ocrText)

        val gpm = extractGpm(ocrText)
        val kda = extractKda(ocrText)

        val objectiveMentions = extractObjectiveMentions(ocrText)
        val shutdownMentioned = Regex("\\bshutdown\\b", RegexOption.IGNORE_CASE).containsMatchIn(ocrText)
        val shutdownGoldMentioned = Regex("\\bshutdown\\s*gold\\b", RegexOption.IGNORE_CASE).containsMatchIn(ocrText)
        val aceOrWipeMentioned = Regex("\\bace\\b|\\bwipe\\b", RegexOption.IGNORE_CASE).containsMatchIn(ocrText)
        val stolenMentioned = Regex("\\bstolen\\b|\\bsteal\\b|\\bstole\\b", RegexOption.IGNORE_CASE).containsMatchIn(ocrText)
        val multiKillTier = extractMultiKillTier(ocrText)

        val deathSpikePresent = false
        val deathSpikeReason = "ocr_unavailable"

        return ExtractedSignals(
            goldDiff = goldDiff,
            goldTrendPerMin = goldTrend,
            minute = minute,
            gpm = gpm,
            kills = kda?.first,
            deaths = kda?.second,
            assists = kda?.third,
            objectiveMentions = objectiveMentions,
            shutdownMentioned = shutdownMentioned,
            shutdownGoldMentioned = shutdownGoldMentioned,
            aceOrWipeMentioned = aceOrWipeMentioned,
            stolenMentioned = stolenMentioned,
            multiKillTier = multiKillTier,
            deathSpikePresent = deathSpikePresent,
            deathSpikeReason = deathSpikeReason,
        )
    }

    private fun extractGpm(text: String): Int? {
        val patterns = listOf(
            Regex("\\bgpm\\s*[:=]\\s*([0-9]{2,4})\\b", RegexOption.IGNORE_CASE),
            Regex("\\bgold\\s*/\\s*min\\s*[:=]?\\s*([0-9]{2,4})\\b", RegexOption.IGNORE_CASE),
        )

        for (p in patterns) {
            val m = p.find(text) ?: continue
            val v = m.groupValues.getOrNull(1)?.toIntOrNull()
            if (v != null) return v
        }

        return null
    }

    private fun extractKda(text: String): Triple<Int, Int, Int>? {
        val patterns = listOf(
            Regex("\\bkda\\s*[:=]\\s*([0-9]{1,2})\\s*/\\s*([0-9]{1,2})\\s*/\\s*([0-9]{1,2})\\b", RegexOption.IGNORE_CASE),
            Regex("\\b([0-9]{1,2})\\s*/\\s*([0-9]{1,2})\\s*/\\s*([0-9]{1,2})\\b"),
        )

        for (p in patterns) {
            val m = p.find(text) ?: continue
            val k = m.groupValues.getOrNull(1)?.toIntOrNull() ?: continue
            val d = m.groupValues.getOrNull(2)?.toIntOrNull() ?: continue
            val a = m.groupValues.getOrNull(3)?.toIntOrNull() ?: continue
            return Triple(k, d, a)
        }

        return null
    }

    private class BlueprintService(private val context: Context) {

        private data class TierBenchmark(
            val gpm: Int,
            val kda: Double,
        )

        private data class WinProbabilityConfig(
            val goldDiffPer1000: Double,
            val gpmRatioWeight: Double,
            val kdaRatioWeight: Double,
            val cap: Double,
        )

        private data class Benchmarks(
            val tiers: Map<String, TierBenchmark>,
            val winProb: WinProbabilityConfig,
        )

        private val benchmarks by lazy { loadBenchmarks() }

        fun generateInsight(
            minute: Int?,
            goldDiff: Int?,
            goldTrendPerMin: Double?,
            gpm: Int?,
            kills: Int?,
            deaths: Int?,
            assists: Int?,
            objectiveMentions: Set<ObjectiveMention>,
            objectiveRisk: ObjectiveRisk,
        ): BlueprintInsight? {
            val tier = pickTier(goal = "master")
            val bench = benchmarks.tiers[tier] ?: return null

            val gpmRatio = if (gpm != null && bench.gpm > 0) gpm.toDouble() / bench.gpm.toDouble() else null
            val kdaNow = computeKda(kills, deaths, assists)
            val kdaRatio = if (kdaNow != null && bench.kda > 0) kdaNow / bench.kda else null

            val delta = computeWinProbabilityDelta(
                minute = minute,
                goldDiff = goldDiff,
                goldTrendPerMin = goldTrendPerMin,
                gpmRatio = gpmRatio,
                kdaRatio = kdaRatio,
            )

            val summary = buildSummary(tier, gpmRatio, kdaRatio)
            val nextMove = buildNextMove(
                tier = tier,
                minute = minute,
                goldDiff = goldDiff,
                gpmRatio = gpmRatio,
                objectiveMentions = objectiveMentions,
                objectiveRisk = objectiveRisk,
            )

            return BlueprintInsight(
                tier = tier,
                gpmRatio = gpmRatio,
                kdaRatio = kdaRatio,
                winProbabilityDelta = delta,
                summary = summary,
                nextMove = nextMove,
            )
        }

        private fun pickTier(goal: String): String {
            return goal.lowercase()
        }

        private fun computeKda(k: Int?, d: Int?, a: Int?): Double? {
            if (k == null || d == null || a == null) return null
            val denom = if (d <= 0) 1.0 else d.toDouble()
            return (k.toDouble() + a.toDouble()) / denom
        }

        private fun computeWinProbabilityDelta(
            minute: Int?,
            goldDiff: Int?,
            goldTrendPerMin: Double?,
            gpmRatio: Double?,
            kdaRatio: Double?,
        ): Double {
            var delta = 0.0
            val cfg = benchmarks.winProb

            if (goldDiff != null) {
                delta += (goldDiff.toDouble() / 1000.0) * cfg.goldDiffPer1000
            }

            if (goldTrendPerMin != null) {
                delta += (goldTrendPerMin / 1000.0) * (cfg.goldDiffPer1000 * 0.75)
            }

            if (gpmRatio != null) {
                delta += (gpmRatio - 1.0) * cfg.gpmRatioWeight
            }

            if (kdaRatio != null) {
                delta += (kdaRatio - 1.0) * cfg.kdaRatioWeight
            }

            val timeFactor = when {
                minute == null -> 1.0
                minute < 6 -> 0.6
                minute < 12 -> 0.9
                minute < 18 -> 1.0
                else -> 1.15
            }

            delta *= timeFactor
            return delta.coerceIn(-cfg.cap, cfg.cap)
        }

        private fun buildSummary(tier: String, gpmRatio: Double?, kdaRatio: Double?): String {
            val gpmPct = gpmRatio?.let { (it * 100.0).toInt() }
            val kdaPct = kdaRatio?.let { (it * 100.0).toInt() }

            val parts = mutableListOf<String>()
            if (gpmPct != null) parts.add("You are tracking at $gpmPct% of ${tier.replaceFirstChar { it.uppercase() }} tier GPM")
            if (kdaPct != null) parts.add("$kdaPct% of ${tier.replaceFirstChar { it.uppercase() }} tier KDA")
            if (parts.isEmpty()) return "Blueprint: need clearer GPM/KDA OCR to compare you to ${tier.replaceFirstChar { it.uppercase() }} benchmarks."
            return parts.joinToString(". ") + "."
        }

        private fun buildNextMove(
            tier: String,
            minute: Int?,
            goldDiff: Int?,
            gpmRatio: Double?,
            objectiveMentions: Set<ObjectiveMention>,
            objectiveRisk: ObjectiveRisk,
        ): String {
            val behind = goldDiff != null && goldDiff < 0
            val underFarm = gpmRatio != null && gpmRatio < 0.9
            val objCalled = objectiveMentions.isNotEmpty()

            if (underFarm && objCalled && objectiveRisk.present && objectiveRisk.probability >= 0.70) {
                return "You’re under ${tier.replaceFirstChar { it.uppercase() }} pace. Take the next 2 safe farm cycles (2 jungle camps / 2 waves) before committing to the objective fight."
            }

            if (underFarm) {
                return "Blueprint next move: prioritize 1-2 safe farm cycles to raise GPM toward ${tier.replaceFirstChar { it.uppercase() }} pace, then rotate on tempo."
            }

            if (behind && objectiveRisk.present && objectiveRisk.probability >= 0.75) {
                return "Blueprint next move: avoid the forced objective. Trade cross-map gold (tower plates / camps) and re-enter when vision is set."
            }

            return "Blueprint next move: play for tempo — push the next safe wave, then rotate early to set vision before the fight."
        }

        private fun loadBenchmarks(): Benchmarks {
            val defaults = Benchmarks(
                tiers = mapOf(
                    "master" to TierBenchmark(gpm = 780, kda = 3.4),
                    "grandmaster" to TierBenchmark(gpm = 860, kda = 3.8),
                ),
                winProb = WinProbabilityConfig(
                    goldDiffPer1000 = 0.04,
                    gpmRatioWeight = 0.18,
                    kdaRatioWeight = 0.10,
                    cap = 0.25,
                )
            )

            return try {
                val raw = context.assets.open("benchmarks/rank_benchmarks.json").bufferedReader().use { it.readText() }
                val obj = JSONObject(raw)

                val tiersObj = obj.optJSONObject("tiers") ?: JSONObject()
                val tiers = mutableMapOf<String, TierBenchmark>()
                val tierKeys = tiersObj.keys()
                while (tierKeys.hasNext()) {
                    val k = tierKeys.next()
                    val tObj = tiersObj.optJSONObject(k) ?: continue
                    val gpm = tObj.optInt("gpm", -1)
                    val kda = tObj.optDouble("kda", -1.0)
                    if (gpm > 0 && kda > 0) tiers[k.lowercase()] = TierBenchmark(gpm = gpm, kda = kda)
                }

                val wpObj = obj.optJSONObject("win_probability") ?: JSONObject()
                val wp = WinProbabilityConfig(
                    goldDiffPer1000 = wpObj.optDouble("gold_diff_per_1000", defaults.winProb.goldDiffPer1000),
                    gpmRatioWeight = wpObj.optDouble("gpm_ratio_weight", defaults.winProb.gpmRatioWeight),
                    kdaRatioWeight = wpObj.optDouble("kda_ratio_weight", defaults.winProb.kdaRatioWeight),
                    cap = wpObj.optDouble("cap", defaults.winProb.cap),
                )

                Benchmarks(
                    tiers = if (tiers.isNotEmpty()) tiers else defaults.tiers,
                    winProb = wp,
                )
            } catch (_: Throwable) {
                defaults
            }
        }
    }

    fun getLatestBlueprintSnapshot(discordUserId: String?): BlueprintSnapshot? {
        if (discordUserId.isNullOrBlank()) return null
        return db.getLatestBlueprintSnapshot(discordUserId)
    }

    private fun extractObjectiveMentions(text: String): Set<ObjectiveMention> {
        val out = mutableSetOf<ObjectiveMention>()
        val lower = text.lowercase()

        if (Regex("\\belder\\b").containsMatchIn(lower)) out.add(ObjectiveMention.ELDER)
        if (Regex("\\bbaron\\b|\\bnash\\b|\\bnashor\\b").containsMatchIn(lower)) out.add(ObjectiveMention.BARON)
        if (Regex("\\bdragon\\b|\\bdrake\\b|\\bmountain\\b|\\binfernal\\b|\\bocean\\b|\\bice\\b").containsMatchIn(lower)) out.add(ObjectiveMention.DRAGON)
        if (Regex("\\bherald\\b").containsMatchIn(lower)) out.add(ObjectiveMention.HERALD)
        if (Regex("\\bturret\\b|\\btower\\b|\\bt\\s*[123]\\b|\\bt[123]\\b").containsMatchIn(lower)) out.add(ObjectiveMention.TURRET)
        if (Regex("\\binhib\\b|\\binhibitor\\b").containsMatchIn(lower)) out.add(ObjectiveMention.INHIB)
        if (Regex("\\bnexus\\b|\\bbase\\b").containsMatchIn(lower)) out.add(ObjectiveMention.NEXUS)

        return out
    }

    private fun extractMinute(text: String): Int? {
        val patterns = listOf(
            Regex("\\b([0-9]{1,2})\\s*[:\\.]\\s*([0-9]{2})\\b"),
            Regex("\\btime\\s*[:=]\\s*([0-9]{1,2})\\s*[:\\.]\\s*([0-9]{2})\\b", RegexOption.IGNORE_CASE),
            Regex("\\b([0-9]{1,2})\\s*min\\b", RegexOption.IGNORE_CASE),
        )

        for (p in patterns) {
            val m = p.find(text) ?: continue
            if (m.groupValues.size >= 3) {
                val min = m.groupValues[1].toIntOrNull()
                if (min != null) return min
            }
            if (m.groupValues.size >= 2) {
                val min = m.groupValues[1].toIntOrNull()
                if (min != null) return min
            }
        }

        return null
    }

    private fun extractMultiKillTier(text: String): MultiKillTier {
        val lower = text.lowercase()
        return when {
            Regex("\\bpenta\\b").containsMatchIn(lower) -> MultiKillTier.PENTA
            Regex("\\bquadra\\b").containsMatchIn(lower) -> MultiKillTier.QUADRA
            Regex("\\btriple\\b").containsMatchIn(lower) -> MultiKillTier.TRIPLE
            Regex("\\bdouble\\b").containsMatchIn(lower) -> MultiKillTier.DOUBLE
            else -> MultiKillTier.NONE
        }
    }

    private fun extractGoldDiff(text: String): Int? {
        val lower = text.lowercase()

        val patterns = listOf(
            Regex("gold\\s*[:=]\\s*([-+]?[0-9]{2,6})"),
            Regex("([-+]?[0-9]{2,6})\\s*(gold|g)"),
            Regex("(gold|g)\\s*([-+]?[0-9]{2,6})"),
        )

        for (p in patterns) {
            val m = p.find(lower) ?: continue
            val numeric = m.groupValues.firstOrNull { it.matches(Regex("[-+]?[0-9]{2,6}")) }
            if (!numeric.isNullOrBlank()) {
                return numeric.toIntOrNull()
            }
        }

        return null
    }

    private fun extractGoldTrendPerMinute(text: String): Double? {
        val lower = text.lowercase()
        val patterns = listOf(
            Regex("gold\\s*trend\\s*[:=]\\s*([-+]?[0-9]+(?:\\.[0-9]+)?)"),
            Regex("([-+]?[0-9]+(?:\\.[0-9]+)?)\\s*gold/min"),
        )

        for (p in patterns) {
            val m = p.find(lower) ?: continue
            val numeric = m.groupValues.firstOrNull { it.matches(Regex("[-+]?[0-9]+(\\.[0-9]+)?")) }
            if (!numeric.isNullOrBlank()) {
                return numeric.toDoubleOrNull()
            }
        }

        return null
    }

    private fun extractThemes(extracted: ExtractedSignals): List<String> {
        val out = mutableListOf<String>()

        val goldDiff = extracted.goldDiff
        if (goldDiff != null && goldDiff < 0) {
            out.add("negative_gold")
        }

        val goldTrend = extracted.goldTrendPerMin
        if (goldTrend != null && goldTrend < 0) {
            out.add("negative_gold_trend")
        }

        if (extracted.deathSpikePresent) {
            out.add("mid_game_death_spike")
        }

        if (extracted.shutdownMentioned) {
            out.add("shutdown")
        }

        if (extracted.shutdownGoldMentioned) {
            out.add("shutdown_gold")
        }

        if (extracted.aceOrWipeMentioned) {
            out.add("ace_or_wipe")
        }

        if (extracted.stolenMentioned) {
            out.add("objective_stolen")
        }

        when (extracted.multiKillTier) {
            MultiKillTier.DOUBLE -> out.add("double_kill")
            MultiKillTier.TRIPLE -> out.add("triple_kill")
            MultiKillTier.QUADRA -> out.add("quadra_kill")
            MultiKillTier.PENTA -> out.add("penta_kill")
            MultiKillTier.NONE -> Unit
        }

        if (extracted.objectiveMentions.isNotEmpty()) {
            out.add("objective_callout")

            if (extracted.objectiveMentions.contains(ObjectiveMention.ELDER)) out.add("elder_callout")
            if (extracted.objectiveMentions.contains(ObjectiveMention.BARON)) out.add("baron_callout")
            if (extracted.objectiveMentions.contains(ObjectiveMention.DRAGON)) out.add("dragon_callout")
            if (extracted.objectiveMentions.contains(ObjectiveMention.HERALD)) out.add("herald_callout")
            if (extracted.objectiveMentions.contains(ObjectiveMention.TURRET)) out.add("turret_callout")
            if (extracted.objectiveMentions.contains(ObjectiveMention.INHIB)) out.add("inhib_callout")
            if (extracted.objectiveMentions.contains(ObjectiveMention.NEXUS)) out.add("nexus_callout")
        }

        return out
    }

    private fun incrementThemes(existing: Map<String, Int>, newThemes: List<String>): Map<String, Int> {
        val out = existing.toMutableMap()
        for (t in newThemes) {
            out[t] = (out[t] ?: 0) + 1
        }
        return out
    }

    private fun topRecurringThemes(themes: Map<String, Int>, limit: Int = 3): List<String> {
        return themes
            .entries
            .sortedWith(compareByDescending<Map.Entry<String, Int>> { it.value }.thenBy { it.key })
            .take(limit)
            .map { it.key }
    }

    private fun computeStage(interactions: Int): RelationshipStage {
        return when {
            interactions >= 120 -> RelationshipStage.LEGEND
            interactions >= 50 -> RelationshipStage.BEST_FRIEND
            interactions >= 20 -> RelationshipStage.FRIEND
            interactions >= 5 -> RelationshipStage.ACQUAINTANCE
            else -> RelationshipStage.STRANGER
        }
    }

    private fun computeTone(
        stage: RelationshipStage,
        extracted: ExtractedSignals,
        recurringThemes: List<String>,
    ): AdviceTone {
        val tilted = extracted.deathSpikePresent
        val behind = (extracted.goldTrendPerMin != null && extracted.goldTrendPerMin < 0) || (extracted.goldDiff != null && extracted.goldDiff < 0)

        if (tilted) return AdviceTone.CALMING

        val repeatedBehind = behind && recurringThemes.any { it == "negative_gold" || it == "negative_gold_trend" }

        return when {
            stage >= RelationshipStage.BEST_FRIEND && repeatedBehind -> AdviceTone.DIRECT
            behind -> AdviceTone.SUPPORTIVE
            else -> AdviceTone.HYPE
        }
    }

    private fun updateSkillRadar(
        current: SkillRadar5D,
        extracted: ExtractedSignals,
        recurringThemes: Map<String, Int>,
    ): SkillRadar5D {
        fun smooth(old: Int, delta: Int): Int {
            val next = (old + delta).coerceIn(0, 100)
            return next
        }

        var mechanics = current.mechanics
        var macro = current.macro
        var decision = current.decisionMaking
        var consistency = current.consistency
        var clutch = current.clutch

        val behind = (extracted.goldTrendPerMin != null && extracted.goldTrendPerMin < 0) || (extracted.goldDiff != null && extracted.goldDiff < 0)
        if (behind) {
            macro = smooth(macro, -2)
            consistency = smooth(consistency, -1)
        }

        if (extracted.deathSpikePresent) {
            decision = smooth(decision, -3)
            consistency = smooth(consistency, -3)
        }

        val behindCount = (recurringThemes["negative_gold"] ?: 0) + (recurringThemes["negative_gold_trend"] ?: 0)
        if (behindCount >= 5) {
            macro = smooth(macro, -2)
        }

        clutch = smooth(clutch, 1)

        return SkillRadar5D(
            mechanics = mechanics,
            macro = macro,
            decisionMaking = decision,
            consistency = consistency,
            clutch = clutch,
        )
    }

    private fun predictObjectiveRisk(extracted: ExtractedSignals): ObjectiveRisk {
        val behind = (extracted.goldTrendPerMin != null && extracted.goldTrendPerMin < 0) || (extracted.goldDiff != null && extracted.goldDiff < 0)
        if (!behind) {
            return ObjectiveRisk(
                present = false,
                probability = 0.0,
                objectiveHint = "",
                reason = "no_negative_gold_signal",
            )
        }

        val cfg = objectiveRiskThresholds
        val hint = objectiveHintFromMentions(extracted.objectiveMentions)

        val severity = computeBehindSeverity(cfg, extracted)
        var p = when (severity) {
            "high" -> cfg.risk.high
            "medium" -> cfg.risk.medium
            "low" -> cfg.risk.low
            else -> cfg.risk.baseWhenBehind
        }

        var reason = "behind_${severity.ifBlank { "base" }}"

        if (extracted.objectiveMentions.isNotEmpty()) {
            p += cfg.risk.objectiveCalloutBonus
            reason = "${reason}_objective_callout"
        }

        if (extracted.shutdownMentioned || extracted.shutdownGoldMentioned) {
            p += cfg.risk.shutdownBonus
            reason = "${reason}_shutdown"
        }

        if (extracted.aceOrWipeMentioned) {
            p += cfg.risk.aceOrWipeBonus
            reason = "${reason}_ace_or_wipe"
        }

        if (extracted.stolenMentioned) {
            p += cfg.risk.stolenBonus
            reason = "${reason}_stolen"
        }

        val windowOk = isInObjectiveWindow(cfg, extracted)
        if (!windowOk && extracted.minute != null && extracted.objectiveMentions.isNotEmpty()) {
            p = minOf(p, cfg.risk.baseWhenBehind)
            reason = "${reason}_hail_mary"
        }

        p = p.coerceIn(0.0, cfg.risk.cap)

        return ObjectiveRisk(
            present = true,
            probability = p,
            objectiveHint = hint,
            reason = reason,
        )
    }

    private fun computeBehindSeverity(cfg: ObjectiveRiskThresholds, extracted: ExtractedSignals): String {
        val gd = extracted.goldDiff
        val gt = extracted.goldTrendPerMin

        val hitHigh = (gd != null && gd <= cfg.goldDiff.high) || (gt != null && gt <= cfg.goldTrendPerMin.high)
        if (hitHigh) return "high"

        val hitMed = (gd != null && gd <= cfg.goldDiff.medium) || (gt != null && gt <= cfg.goldTrendPerMin.medium)
        if (hitMed) return "medium"

        val hitLow = (gd != null && gd <= cfg.goldDiff.low) || (gt != null && gt <= cfg.goldTrendPerMin.low)
        if (hitLow) return "low"

        return ""
    }

    private fun isInObjectiveWindow(cfg: ObjectiveRiskThresholds, extracted: ExtractedSignals): Boolean {
        val minute = extracted.minute ?: return true
        val mentions = extracted.objectiveMentions
        if (mentions.isEmpty()) return true

        val key = when {
            mentions.contains(ObjectiveMention.ELDER) -> "elder"
            mentions.contains(ObjectiveMention.BARON) -> "baron"
            mentions.contains(ObjectiveMention.DRAGON) -> "dragon"
            mentions.contains(ObjectiveMention.HERALD) -> "herald"
            else -> return true
        }

        val range = cfg.windowsMinutes[key] ?: return true
        return minute in range
    }

    private fun objectiveHintFromMentions(mentions: Set<ObjectiveMention>): String {
        return when {
            mentions.contains(ObjectiveMention.ELDER) -> "Elder fight"
            mentions.contains(ObjectiveMention.BARON) -> "Baron fight"
            mentions.contains(ObjectiveMention.DRAGON) -> "Dragon fight"
            mentions.contains(ObjectiveMention.HERALD) -> "Herald fight"
            mentions.contains(ObjectiveMention.INHIB) -> "Inhib defense"
            mentions.contains(ObjectiveMention.TURRET) -> "Tower defense"
            mentions.contains(ObjectiveMention.NEXUS) -> "Nexus defense"
            else -> "Next objective fight"
        }
    }

    private fun buildMessage(
        stage: RelationshipStage,
        tone: AdviceTone,
        ocrText: String,
        extracted: ExtractedSignals,
        recurringThemes: List<String>,
        objectiveRisk: ObjectiveRisk,
    ): String {
        val prefix = when (stage) {
            RelationshipStage.STRANGER -> "I’ve got you. Quick read:"
            RelationshipStage.ACQUAINTANCE -> "Okay — I’m tracking your patterns now:"
            RelationshipStage.FRIEND -> "Alright friend, here’s the play:"
            RelationshipStage.BEST_FRIEND -> "You and I both know this moment — listen:"
            RelationshipStage.LEGEND -> "Legend mode. We fix this instantly:"
        }

        val toneLine = when (tone) {
            AdviceTone.SUPPORTIVE -> "No panic. We can stabilize with two clean decisions."
            AdviceTone.CALMING -> "Breathe. Slow the next 30 seconds down and play for info first."
            AdviceTone.DIRECT -> "Stop the bleed. Do NOT take a fair fight right now."
            AdviceTone.HYPE -> "You’re in it — one sharp rotation and we swing this."
        }

        val trendBits = mutableListOf<String>()
        extracted.goldDiff?.let { gd ->
            if (gd < 0) trendBits.add("Gold is behind ($gd).")
        }
        extracted.goldTrendPerMin?.let { gt ->
            if (gt < 0) trendBits.add("Gold trend is negative (${String.format("%.0f", gt)} / min).")
        }

        val intensityLine = if (extracted.stolenMentioned) {
            "STOLEN. That’s a momentum nuke — we punish the map instantly."
        } else {
            ""
        }

        val predictionLine = if (objectiveRisk.present) {
            "Prediction: ${String.format("%.0f", objectiveRisk.probability * 100)}% chance you lose ${objectiveRisk.objectiveHint.lowercase()} if you facecheck or force."
        } else {
            ""
        }

        val recurring = if (recurringThemes.isNotEmpty()) {
            "Recurring themes: ${recurringThemes.joinToString(", ")}."
        } else {
            ""
        }

        val ocrHint = "I read: '${ocrText.take(160)}'"

        val steps = when {
            objectiveRisk.present -> "Plan for ${objectiveRisk.objectiveHint.lowercase()}: reset waves, group early, drop 1 ward line, ping off the bad angle."
            else -> "Plan: take the next safe farm cycle and rotate on tempo."
        }

        val parts = listOf(prefix, toneLine) +
            trendBits +
            listOfNotNull(
                intensityLine.takeIf { it.isNotBlank() },
                predictionLine.takeIf { it.isNotBlank() },
                recurring.takeIf { it.isNotBlank() },
                steps,
                ocrHint,
            )

        return parts.joinToString(" ")
    }

    private fun inferMemoryMoment(extracted: ExtractedSignals, ocrText: String): Pair<MemoryMomentType, String>? {
        when (extracted.multiKillTier) {
            MultiKillTier.PENTA -> return MemoryMomentType.EPIC_PLAY to "Penta kill moment — peak execution under pressure."
            MultiKillTier.QUADRA -> return MemoryMomentType.EPIC_PLAY to "Quadra kill moment — you took over the fight."
            MultiKillTier.TRIPLE -> return MemoryMomentType.EPIC_PLAY to "Triple kill moment — clean swing in your favor."
            MultiKillTier.DOUBLE -> return MemoryMomentType.EPIC_PLAY to "Double kill moment — strong fight read."
            MultiKillTier.NONE -> Unit
        }

        if (extracted.stolenMentioned) {
            return MemoryMomentType.CLUTCH to "Objective steal moment — emotional spike + massive tempo swing."
        }

        if (extracted.aceOrWipeMentioned) {
            return MemoryMomentType.CLUTCH to "Ace/wipe moment — fight outcome decided the map state."
        }

        val behind = (extracted.goldTrendPerMin != null && extracted.goldTrendPerMin < 0) || (extracted.goldDiff != null && extracted.goldDiff < 0)
        if (behind) {
            return MemoryMomentType.LEARNING to "We identified a negative gold swing moment and stabilized around the next objective.".trim()
        }
        return null
    }

    private fun loadTrendThresholds(): TrendThresholds {
        return try {
            val raw = context.assets.open("benchmarks/trend_thresholds.json").bufferedReader().use { it.readText() }
            val obj = JSONObject(raw)
            val deathSpike = obj.optJSONObject("death_spike") ?: JSONObject()
            val window = deathSpike.optJSONArray("mid_game_window_minutes") ?: JSONArray().put(8).put(15)
            val start = window.optInt(0, 8)
            val end = window.optInt(1, 15)
            val thr = deathSpike.optDouble("share_threshold", 0.5)
            TrendThresholds(start, end, thr)
        } catch (_: Throwable) {
            TrendThresholds(8, 15, 0.5)
        }
    }

    private fun loadObjectiveRiskThresholds(): ObjectiveRiskThresholds {
        val defaults = ObjectiveRiskThresholds(
            windowsMinutes = mapOf(
                "herald" to (4..10),
                "dragon" to (4..26),
                "baron" to (11..30),
                "elder" to (18..30),
            ),
            goldDiff = ThresholdTripletInt(low = -800, medium = -2000, high = -4000),
            goldTrendPerMin = ThresholdTripletDouble(low = -60.0, medium = -150.0, high = -250.0),
            risk = RiskProbabilities(
                baseWhenBehind = 0.55,
                low = 0.62,
                medium = 0.74,
                high = 0.85,
                cap = 0.92,
                objectiveCalloutBonus = 0.04,
                shutdownBonus = 0.05,
                aceOrWipeBonus = 0.08,
                stolenBonus = 0.12,
            ),
        )

        return try {
            val raw = context.assets.open("benchmarks/objective_risk_thresholds.json").bufferedReader().use { it.readText() }
            val obj = JSONObject(raw)

            val windowsObj = obj.optJSONObject("objective_windows_minutes") ?: JSONObject()
            val windows = mutableMapOf<String, IntRange>()
            val keys = windowsObj.keys()
            while (keys.hasNext()) {
                val k = keys.next()
                val arr = windowsObj.optJSONArray(k) ?: continue
                val start = arr.optInt(0, -1)
                val end = arr.optInt(1, -1)
                if (start >= 0 && end >= 0) windows[k] = (start..end)
            }

            val gd = obj.optJSONObject("gold_diff") ?: JSONObject()
            val gt = obj.optJSONObject("gold_trend_per_min") ?: JSONObject()
            val riskObj = obj.optJSONObject("risk_probability") ?: JSONObject()

            ObjectiveRiskThresholds(
                windowsMinutes = if (windows.isNotEmpty()) windows else defaults.windowsMinutes,
                goldDiff = ThresholdTripletInt(
                    low = gd.optInt("low", defaults.goldDiff.low),
                    medium = gd.optInt("medium", defaults.goldDiff.medium),
                    high = gd.optInt("high", defaults.goldDiff.high),
                ),
                goldTrendPerMin = ThresholdTripletDouble(
                    low = gt.optDouble("low", defaults.goldTrendPerMin.low),
                    medium = gt.optDouble("medium", defaults.goldTrendPerMin.medium),
                    high = gt.optDouble("high", defaults.goldTrendPerMin.high),
                ),
                risk = RiskProbabilities(
                    baseWhenBehind = riskObj.optDouble("base_when_behind", defaults.risk.baseWhenBehind),
                    low = riskObj.optDouble("low", defaults.risk.low),
                    medium = riskObj.optDouble("medium", defaults.risk.medium),
                    high = riskObj.optDouble("high", defaults.risk.high),
                    cap = riskObj.optDouble("cap", defaults.risk.cap),
                    objectiveCalloutBonus = riskObj.optDouble("objective_callout_bonus", defaults.risk.objectiveCalloutBonus),
                    shutdownBonus = riskObj.optDouble("shutdown_bonus", defaults.risk.shutdownBonus),
                    aceOrWipeBonus = riskObj.optDouble("ace_or_wipe_bonus", defaults.risk.aceOrWipeBonus),
                    stolenBonus = riskObj.optDouble("stolen_bonus", defaults.risk.stolenBonus),
                ),
            )
        } catch (_: Throwable) {
            defaults
        }
    }

    private data class ProfileRow(
        val discordUserId: String,
        val interactions: Int,
        val lastSeenAtMs: Long,
        val stage: RelationshipStage,
        val skillRadar: SkillRadar5D,
        val recurringThemes: Map<String, Int>,
    )

    private class AresDb(context: Context) : SQLiteOpenHelper(context, DB_NAME, null, DB_VERSION) {

        override fun onCreate(db: SQLiteDatabase) {
            db.execSQL(
                """
                CREATE TABLE IF NOT EXISTS user_profile (
                  discord_user_id TEXT PRIMARY KEY,
                  interactions INTEGER NOT NULL,
                  last_seen_at_ms INTEGER NOT NULL,
                  stage TEXT NOT NULL,
                  skill_radar_json TEXT NOT NULL,
                  recurring_themes_json TEXT NOT NULL
                )
                """.trimIndent()
            )

            db.execSQL(
                """
                CREATE TABLE IF NOT EXISTS memory_moment (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  discord_user_id TEXT NOT NULL,
                  type TEXT NOT NULL,
                  text TEXT NOT NULL,
                  tags_json TEXT NOT NULL,
                  created_at_ms INTEGER NOT NULL
                )
                """.trimIndent()
            )

            db.execSQL(
                """
                CREATE TABLE IF NOT EXISTS advice_history (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  discord_user_id TEXT NOT NULL,
                  message TEXT NOT NULL,
                  themes_json TEXT NOT NULL,
                  ocr_excerpt TEXT NOT NULL,
                  created_at_ms INTEGER NOT NULL
                )
                """.trimIndent()
            )

            db.execSQL(
                """
                CREATE TABLE IF NOT EXISTS blueprint_history (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  discord_user_id TEXT NOT NULL,
                  created_at_ms INTEGER NOT NULL,
                  minute INTEGER,
                  gold_diff INTEGER,
                  gold_trend_per_min REAL,
                  gpm INTEGER,
                  kills INTEGER,
                  deaths INTEGER,
                  assists INTEGER,
                  win_probability_delta REAL NOT NULL,
                  tier TEXT NOT NULL,
                  insight_summary TEXT NOT NULL,
                  next_move TEXT NOT NULL
                )
                """.trimIndent()
            )

            db.execSQL(
                "CREATE INDEX IF NOT EXISTS idx_memory_user ON memory_moment(discord_user_id, created_at_ms)"
            )
            db.execSQL(
                "CREATE INDEX IF NOT EXISTS idx_advice_user ON advice_history(discord_user_id, created_at_ms)"
            )
            db.execSQL(
                "CREATE INDEX IF NOT EXISTS idx_blueprint_user ON blueprint_history(discord_user_id, created_at_ms)"
            )
        }

        override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
            db.execSQL("DROP TABLE IF EXISTS advice_history")
            db.execSQL("DROP TABLE IF EXISTS blueprint_history")
            db.execSQL("DROP TABLE IF EXISTS memory_moment")
            db.execSQL("DROP TABLE IF EXISTS user_profile")
            onCreate(db)
        }

        fun insertBlueprintSnapshot(
            discordUserId: String,
            createdAtMs: Long,
            minute: Int?,
            goldDiff: Int?,
            goldTrendPerMin: Double?,
            gpm: Int?,
            kills: Int?,
            deaths: Int?,
            assists: Int?,
            winProbabilityDelta: Double,
            tier: String,
            insightSummary: String,
            nextMove: String,
        ) {
            val db = writableDatabase
            val cv = ContentValues().apply {
                put("discord_user_id", discordUserId)
                put("created_at_ms", createdAtMs)
                if (minute != null) put("minute", minute)
                if (goldDiff != null) put("gold_diff", goldDiff)
                if (goldTrendPerMin != null) put("gold_trend_per_min", goldTrendPerMin)
                if (gpm != null) put("gpm", gpm)
                if (kills != null) put("kills", kills)
                if (deaths != null) put("deaths", deaths)
                if (assists != null) put("assists", assists)
                put("win_probability_delta", winProbabilityDelta)
                put("tier", tier)
                put("insight_summary", insightSummary)
                put("next_move", nextMove)
            }
            db.insert("blueprint_history", null, cv)

            db.execSQL(
                """
                DELETE FROM blueprint_history
                WHERE id NOT IN (
                    SELECT id FROM blueprint_history
                    WHERE discord_user_id = ?
                    ORDER BY created_at_ms DESC
                    LIMIT 50
                ) AND discord_user_id = ?
                """.trimIndent(),
                arrayOf(discordUserId, discordUserId)
            )
        }

        fun getLatestBlueprintSnapshot(discordUserId: String): BlueprintSnapshot? {
            val db = readableDatabase
            val cur = db.query(
                "blueprint_history",
                arrayOf(
                    "created_at_ms",
                    "tier",
                    "insight_summary",
                    "next_move",
                    "win_probability_delta",
                ),
                "discord_user_id = ?",
                arrayOf(discordUserId),
                null,
                null,
                "created_at_ms DESC",
                "1",
            )

            cur.use {
                if (!it.moveToFirst()) return null
                val createdAtMs = it.getLong(it.getColumnIndexOrThrow("created_at_ms"))
                val tier = it.getString(it.getColumnIndexOrThrow("tier"))
                val summary = it.getString(it.getColumnIndexOrThrow("insight_summary"))
                val nextMove = it.getString(it.getColumnIndexOrThrow("next_move"))
                val delta = it.getDouble(it.getColumnIndexOrThrow("win_probability_delta"))

                return BlueprintSnapshot(
                    createdAtMs = createdAtMs,
                    tier = tier,
                    summary = summary,
                    nextMove = nextMove,
                    winProbabilityDelta = delta,
                )
            }
        }

        fun loadOrCreateProfile(discordUserId: String): ProfileRow {
            val db = readableDatabase
            val cur = db.query(
                "user_profile",
                arrayOf(
                    "discord_user_id",
                    "interactions",
                    "last_seen_at_ms",
                    "stage",
                    "skill_radar_json",
                    "recurring_themes_json",
                ),
                "discord_user_id = ?",
                arrayOf(discordUserId),
                null,
                null,
                null,
            )

            cur.use {
                if (it.moveToFirst()) {
                    return profileFromCursor(it)
                }
            }

            val initial = ProfileRow(
                discordUserId = discordUserId,
                interactions = 0,
                lastSeenAtMs = 0L,
                stage = RelationshipStage.STRANGER,
                skillRadar = SkillRadar5D.default(),
                recurringThemes = emptyMap(),
            )

            saveProfile(
                discordUserId = discordUserId,
                interactions = initial.interactions,
                lastSeenAtMs = System.currentTimeMillis(),
                stage = initial.stage,
                skillRadar = initial.skillRadar,
                recurringThemes = initial.recurringThemes,
            )

            return initial
        }

        fun saveProfile(
            discordUserId: String,
            interactions: Int,
            lastSeenAtMs: Long,
            stage: RelationshipStage,
            skillRadar: SkillRadar5D,
            recurringThemes: Map<String, Int>,
        ) {
            val db = writableDatabase
            val cv = ContentValues().apply {
                put("discord_user_id", discordUserId)
                put("interactions", interactions)
                put("last_seen_at_ms", lastSeenAtMs)
                put("stage", stage.name)
                put("skill_radar_json", skillRadar.toJson().toString())
                put("recurring_themes_json", themesToJson(recurringThemes).toString())
            }
            db.insertWithOnConflict("user_profile", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
        }

        fun insertMemoryMoment(
            discordUserId: String,
            type: MemoryMomentType,
            text: String,
            tags: List<String>,
            createdAtMs: Long,
        ) {
            val db = writableDatabase
            val cv = ContentValues().apply {
                put("discord_user_id", discordUserId)
                put("type", type.name)
                put("text", text)
                put("tags_json", JSONArray(tags).toString())
                put("created_at_ms", createdAtMs)
            }
            db.insert("memory_moment", null, cv)
        }

        fun insertAdviceHistory(
            discordUserId: String,
            message: String,
            themes: List<String>,
            ocrExcerpt: String,
            createdAtMs: Long,
        ) {
            val db = writableDatabase
            val cv = ContentValues().apply {
                put("discord_user_id", discordUserId)
                put("message", message)
                put("themes_json", JSONArray(themes).toString())
                put("ocr_excerpt", ocrExcerpt)
                put("created_at_ms", createdAtMs)
            }
            db.insert("advice_history", null, cv)

            db.execSQL(
                """
                DELETE FROM advice_history
                WHERE id NOT IN (
                    SELECT id FROM advice_history
                    WHERE discord_user_id = ?
                    ORDER BY created_at_ms DESC
                    LIMIT 20
                ) AND discord_user_id = ?
                """.trimIndent(),
                arrayOf(discordUserId, discordUserId)
            )
        }

        private fun profileFromCursor(c: Cursor): ProfileRow {
            val id = c.getString(c.getColumnIndexOrThrow("discord_user_id"))
            val interactions = c.getInt(c.getColumnIndexOrThrow("interactions"))
            val lastSeen = c.getLong(c.getColumnIndexOrThrow("last_seen_at_ms"))
            val stageRaw = c.getString(c.getColumnIndexOrThrow("stage"))
            val radarRaw = c.getString(c.getColumnIndexOrThrow("skill_radar_json"))
            val themesRaw = c.getString(c.getColumnIndexOrThrow("recurring_themes_json"))

            val stage = try {
                RelationshipStage.valueOf(stageRaw)
            } catch (_: Throwable) {
                RelationshipStage.STRANGER
            }

            return ProfileRow(
                discordUserId = id,
                interactions = interactions,
                lastSeenAtMs = lastSeen,
                stage = stage,
                skillRadar = SkillRadar5D.fromJson(radarRaw),
                recurringThemes = themesFromJson(themesRaw),
            )
        }

        private fun themesToJson(themes: Map<String, Int>): JSONObject {
            val obj = JSONObject()
            for ((k, v) in themes) {
                obj.put(k, v)
            }
            return obj
        }

        private fun themesFromJson(raw: String?): Map<String, Int> {
            if (raw.isNullOrBlank()) return emptyMap()
            return try {
                val obj = JSONObject(raw)
                val out = mutableMapOf<String, Int>()
                val keys = obj.keys()
                while (keys.hasNext()) {
                    val k = keys.next()
                    out[k] = obj.optInt(k, 0)
                }
                out
            } catch (_: Throwable) {
                emptyMap()
            }
        }

        companion object {
            private const val DB_NAME = "ares_intelligence.db"
            private const val DB_VERSION = 2
        }
    }
}
