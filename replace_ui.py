import re

with open("src/pages/Onboarding.tsx", "r") as f:
    content = f.read()

# Make the layout super playful (Neo-brutalism / Kawaii)
content = content.replace(
    '<div className="hidden md:flex min-h-screen bg-background">',
    '<div className="hidden md:flex min-h-screen bg-[#FFFBEB] font-sans selection:bg-pink-300">'
)

content = content.replace(
    '<div className="relative w-80 shrink-0 bg-primary flex flex-col overflow-hidden">',
    '<div className="relative w-80 shrink-0 bg-[#4ADE80] border-r-8 border-black flex flex-col overflow-hidden z-10">'
)

content = content.replace(
    'className="flex flex-1 flex-col"',
    'className="flex flex-1 flex-col bg-[#FFFBEB] relative bg-[radial-gradient(#CBD5E1_2px,transparent_2px)] [background-size:32px_32px]"'
)

# Fun text styles
content = content.replace(
    '<h2 className="text-3xl font-black text-foreground tracking-tight drop-shadow-sm">',
    '<h2 className="text-4xl font-black text-black tracking-tight drop-shadow-[2px_2px_0px_#4ADE80] mb-4">'
)
content = content.replace(
    'text-3xl font-black text-foreground tracking-tight',
    'text-4xl font-black text-black tracking-tight drop-shadow-[2px_2px_0px_#F472B6]'
)
content = content.replace(
    'text-2xl font-bold text-foreground',
    'text-4xl font-black text-black drop-shadow-[2px_2px_0px_#FBBF24]'
)

# Neo-brutalist buttons (Next / Prev)
content = content.replace(
    '<Button className="rounded-xl bg-primary text-primary-foreground gap-2 px-8"',
    '<Button className="rounded-2xl bg-[#F472B6] text-black border-4 border-black font-black text-lg gap-2 px-8 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"'
)
content = content.replace(
    '<Button className="rounded-2xl bg-primary text-white font-bold gap-2 px-8 h-12 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"',
    '<Button className="rounded-2xl bg-[#F472B6] text-black border-4 border-black font-black text-lg gap-2 px-8 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:scale-95 transition-all"'
)
content = content.replace(
    '<Button variant="outline" className="rounded-xl border-border/50 gap-2"',
    '<Button variant="outline" className="rounded-2xl bg-white text-black border-4 border-black font-black text-lg gap-2 px-6 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"'
)

# Neo-brutalist inputs
content = content.replace(
    'className="rounded-xl border-border/50 bg-card h-11"',
    'className="rounded-2xl border-4 border-black bg-white h-14 px-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-bold text-base focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"'
)
content = content.replace(
    'className="rounded-2xl border-2 border-border/50 bg-card h-12 px-4 shadow-sm hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-medium"',
    'className="rounded-2xl border-4 border-black bg-white h-14 px-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-bold text-base focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"'
)

# Drag drop area
content = content.replace(
    'rounded-[2.5rem] border-4 border-dashed p-12',
    'rounded-[3rem] border-4 border-black bg-[#FDE68A] p-12 shadow-[8px_8px_0px_rgba(0,0,0,1)]'
)

# Cards
content = content.replace(
    'rounded-3xl border-2 border-border/20 bg-card p-5',
    'rounded-3xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]'
)

# Pills / Badges
content = content.replace(
    'bg-primary text-primary-foreground border-primary',
    'bg-[#38BDF8] text-black border-4 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]'
)
content = content.replace(
    'bg-card text-foreground border-border/50',
    'bg-white text-black border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]'
)

with open("src/pages/Onboarding.tsx", "w") as f:
    f.write(content)
print("Applied Kawaii / Neo-Brutalist theme!")
