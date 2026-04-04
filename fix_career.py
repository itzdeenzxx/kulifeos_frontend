import re

with open("src/pages/CareerInsights.tsx", "r") as f:
    content = f.read()

# Change localStorage keys to be scoped to the user ID
content = content.replace(
    'localStorage.getItem("ku_career_insight_history")',
    'localStorage.getItem(`ku_career_insight_history_${localStorage.getItem("ku_current_user_id") || "guest"}`)'
)
content = content.replace(
    'localStorage.setItem("ku_career_insight_history", JSON.stringify(newHistory));',
    'localStorage.setItem(`ku_career_insight_history_${localStorage.getItem("ku_current_user_id") || "guest"}`, JSON.stringify(newHistory));'
)
content = content.replace(
    'localStorage.setItem("ku_career_insight", JSON.stringify(result)); // For Dashboard',
    'localStorage.setItem(`ku_career_insight_${localStorage.getItem("ku_current_user_id") || "guest"}`, JSON.stringify(result));'
)

with open("src/pages/CareerInsights.tsx", "w") as f:
    f.write(content)
print("done")
