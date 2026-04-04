import re

with open("src/pages/Profile.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'localStorage.getItem("ku_profile")',
    'localStorage.getItem(`ku_profile_${localStorage.getItem("ku_current_user_id") || "guest"}`)'
)
content = content.replace(
    'localStorage.setItem("ku_profile", ',
    'localStorage.setItem(`ku_profile_${localStorage.getItem("ku_current_user_id") || "guest"}`, '
)

with open("src/pages/Profile.tsx", "w") as f:
    f.write(content)
print("Profile fixed")
