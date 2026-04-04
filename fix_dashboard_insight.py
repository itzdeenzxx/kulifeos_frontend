import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'localStorage.getItem("ku_career_insight")',
    'localStorage.getItem(`ku_career_insight_${localStorage.getItem("ku_current_user_id") || "guest"}`)'
)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
print("Dashboard insight fixed")
