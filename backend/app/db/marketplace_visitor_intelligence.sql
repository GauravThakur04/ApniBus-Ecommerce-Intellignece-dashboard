-- ============================================================================
-- APNIBUS 5 POS SALES/DAY CONTROL CENTER — SQL INTELLIGENCE LAYER
-- Data Source: Metabase tracker table (marketplace_visitor) & Google Sheets Orders
-- ============================================================================

-- 1. BASE QUERY (Standard raw event extraction from Metabase)
SELECT 
    id,
    visitor_id,
    marketplace,
    created_at,
    json_extract_path_text(meta_data, 'utm_campaign') AS utm_campaign,
    json_extract_path_text(meta_data, 'utm_medium') AS utm_medium,
    json_extract_path_text(meta_data, 'utm_source') AS utm_source,
    json_extract_path_text(meta_data, 'utm_content') AS utm_content,
    json_extract_path_text(meta_data, 'adset_name') AS adset_name,
    json_extract_path_text(meta_data, 'ad_name') AS ad_name,
    json_extract_path_text(meta_data, 'device') AS device,
    json_extract_path_text(meta_data, 'ip') AS ip,
    json_extract_path_text(meta_data, 'first_visit') AS first_visit_flag
FROM marketplace_visitor
ORDER BY created_at DESC;

-- 2. VISITOR-LEVEL INTELLIGENCE VIEW (Deduplicated visitor metrics & Intent Tiers)
CREATE OR REPLACE VIEW view_visitor_intelligence AS
WITH parsed_events AS (
    SELECT 
        id,
        visitor_id,
        LOWER(COALESCE(marketplace, 'unknown')) AS marketplace,
        created_at,
        DATE(created_at) AS event_date,
        json_extract_path_text(meta_data, 'utm_campaign') AS campaign,
        json_extract_path_text(meta_data, 'utm_medium') AS adset,
        json_extract_path_text(meta_data, 'utm_content') AS ad_creative,
        json_extract_path_text(meta_data, 'device') AS device,
        json_extract_path_text(meta_data, 'first_visit') AS first_visit_flag
    FROM marketplace_visitor
    WHERE visitor_id IS NOT NULL AND visitor_id != ''
),
visitor_summary AS (
    SELECT 
        visitor_id,
        MIN(created_at) AS first_seen,
        MAX(created_at) AS last_seen,
        COUNT(*) AS visit_count,
        COUNT(DISTINCT event_date) AS number_of_active_days,
        COUNT(DISTINCT marketplace) AS distinct_marketplaces_count,
        MAX(CASE WHEN marketplace = 'amazon' THEN 1 ELSE 0 END) AS used_amazon,
        MAX(CASE WHEN marketplace = 'flipkart' THEN 1 ELSE 0 END) AS used_flipkart,
        MAX(device) AS primary_device,
        MAX(campaign) AS primary_campaign,
        MAX(adset) AS primary_adset,
        MAX(ad_creative) AS primary_ad_creative,
        BOOL_OR(first_visit_flag = 'true') AS has_first_visit_flag
    FROM parsed_events
    GROUP BY visitor_id
)
SELECT 
    visitor_id,
    first_seen,
    last_seen,
    visit_count,
    number_of_active_days,
    CASE 
        WHEN distinct_marketplaces_count > 1 THEN 'Both (Amazon + Flipkart)'
        WHEN used_amazon = 1 THEN 'Amazon'
        ELSE 'Flipkart'
    END AS marketplaces_used,
    primary_campaign AS campaign,
    primary_adset AS adset,
    primary_ad_creative AS ad,
    primary_device AS device_platform,
    has_first_visit_flag AS first_visit,
    last_seen AS latest_visit_time,
    CASE WHEN visit_count >= 2 THEN 'RETURNING' ELSE 'NEW' END AS returning_visitor_status,
    CASE WHEN number_of_active_days > 1 THEN 'MULTI-DAY' ELSE 'SINGLE-DAY' END AS multiday_visitor_status,
    CASE WHEN distinct_marketplaces_count > 1 THEN 'CROSS-MARKETPLACE' ELSE 'SINGLE-MARKETPLACE' END AS cross_marketplace_status,
    -- Intent Classification Rule:
    -- 1 visit = NEW | 2 visits = WARM | 3+ visits = HOT | multi-day = HIGH INTENT
    CASE 
        WHEN number_of_active_days > 1 THEN 'HIGH INTENT'
        WHEN visit_count >= 3 THEN 'HOT'
        WHEN visit_count = 2 THEN 'WARM'
        ELSE 'NEW'
    END AS intent_classification
FROM visitor_summary;

-- 3. NEW VS RETURNING TRAFFIC SUMMARY BY DAY & CAMPAIGN
CREATE OR REPLACE VIEW view_traffic_composition_daily AS
SELECT 
    DATE(created_at) AS activity_date,
    LOWER(marketplace) AS marketplace,
    COUNT(*) AS total_clicks,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(DISTINCT CASE WHEN v.returning_visitor_status = 'NEW' THEN v.visitor_id END) AS new_visitors,
    COUNT(DISTINCT CASE WHEN v.returning_visitor_status = 'RETURNING' THEN v.visitor_id END) AS returning_visitors,
    ROUND(
        COUNT(DISTINCT CASE WHEN v.returning_visitor_status = 'RETURNING' THEN v.visitor_id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT visitor_id), 0) * 100, 1
    ) AS returning_visitor_pct,
    COUNT(DISTINCT CASE WHEN v.multiday_visitor_status = 'MULTI-DAY' THEN v.visitor_id END) AS multiday_visitors,
    COUNT(DISTINCT CASE WHEN v.visit_count >= 2 THEN v.visitor_id END) AS visitors_with_2plus_interactions,
    COUNT(DISTINCT CASE WHEN v.visit_count >= 3 THEN v.visitor_id END) AS visitors_with_3plus_interactions,
    COUNT(DISTINCT CASE WHEN v.cross_marketplace_status = 'CROSS-MARKETPLACE' THEN v.visitor_id END) AS cross_marketplace_visitors
FROM marketplace_visitor mv
LEFT JOIN view_visitor_intelligence v ON mv.visitor_id = v.visitor_id
GROUP BY DATE(created_at), LOWER(marketplace)
ORDER BY activity_date DESC;

-- 4. 5-TIER RETARGETING READINESS AUDIENCES (MEASUREMENT LAYER)
-- Note: Audience measurement only; export criteria to Meta/Google Ads
CREATE OR REPLACE VIEW view_retargeting_readiness_audiences AS
SELECT 
    'Audience A: Warm (2 visits, No verified order)' AS audience_name,
    COUNT(*) AS audience_size
FROM view_visitor_intelligence
WHERE visit_count = 2
UNION ALL
SELECT 
    'Audience B: Hot (3+ visits, No verified order)' AS audience_name,
    COUNT(*) AS audience_size
FROM view_visitor_intelligence
WHERE visit_count >= 3
UNION ALL
SELECT 
    'Audience C: High Intent (Multi-day visitor, No verified order)' AS audience_name,
    COUNT(*) AS audience_size
FROM view_visitor_intelligence
WHERE number_of_active_days > 1
UNION ALL
SELECT 
    'Audience D: Cross-Marketplace (Amazon + Flipkart, No verified order)' AS audience_name,
    COUNT(*) AS audience_size
FROM view_visitor_intelligence
WHERE cross_marketplace_status = 'CROSS-MARKETPLACE'
UNION ALL
SELECT 
    'Audience E: Recent Active (Visited in Last 24-48 Hours)' AS audience_name,
    COUNT(*) AS audience_size
FROM view_visitor_intelligence
WHERE last_seen >= NOW() - INTERVAL '48 HOURS';
