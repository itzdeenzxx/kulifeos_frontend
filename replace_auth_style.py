import re

with open("src/pages/Onboarding.tsx", "r") as f:
    content = f.read()

# 1. Backgrounds
content = content.replace(
    'bg-[#FFFBEB] font-sans selection:bg-pink-300',
    'bg-slate-50 font-sans selection:bg-primary/20'
)
content = content.replace(
    'bg-[#4ADE80] border-r-8 border-black',
    'bg-gradient-to-b from-[#006664] to-[#023b3a]'
)
content = content.replace(
    'bg-[#FFFBEB] relative bg-[radial-gradient(#CBD5E1_2px,transparent_2px)] [background-size:32px_32px]',
    'bg-slate-50 relative'
)

# 2. Typography & Shadows
content = content.replace(
    'text-4xl font-black text-black tracking-tight drop-shadow-[2px_2px_0px_#4ADE80] mb-4',
    'text-3xl font-display font-bold text-slate-900 tracking-tight mb-2'
)
content = content.replace(
    'text-4xl font-black text-black tracking-tight drop-shadow-[2px_2px_0px_#F472B6]',
    'text-3xl font-display font-bold text-slate-900 tracking-tight'
)
content = content.replace(
    'text-4xl font-black text-black drop-shadow-[2px_2px_0px_#FBBF24]',
    'text-3xl font-display font-bold text-slate-900 tracking-tight'
)

# 3. Buttons
content = content.replace(
    '<Button className="rounded-2xl bg-[#F472B6] text-black border-4 border-black font-black text-lg gap-2 px-8 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"',
    '<Button className="rounded-full bg-slate-900 text-white font-medium gap-2 px-8 h-12 shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"'
)
content = content.replace(
    '<Button className="rounded-2xl bg-[#F472B6] text-black border-4 border-black font-black text-lg gap-2 px-8 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:scale-95 transition-all"',
    '<Button className="rounded-full bg-slate-900 text-white font-medium gap-2 px-8 h-12 shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-all"'
)
content = content.replace(
    '<Button variant="outline" className="rounded-2xl bg-white text-black border-4 border-black font-black text-lg gap-2 px-6 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"',
    '<Button variant="outline" className="rounded-full bg-white text-slate-700 border border-slate-200 font-medium gap-2 px-6 h-12 shadow-sm hover:bg-slate-50 transition-all font-display"'
)

# 4. Inputs
content = content.replace(
    'className="rounded-2xl border-4 border-black bg-white h-14 px-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-bold text-base focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"',
    'className="rounded-xl border border-slate-200 bg-white h-12 px-4 shadow-sm focus:border-[#009e9a] focus:ring-2 focus:ring-[#009e9a]/20 transition-all font-medium"'
)

# 5. Containers
content = content.replace(
    'rounded-[3rem] border-4 border-black bg-[#FDE68A] p-12 shadow-[8px_8px_0px_rgba(0,0,0,1)]',
    'rounded-[2rem] border-2 border-dashed border-[#009e9a]/30 bg-[#009e9a]/5 p-12 transition-all hover:bg-[#009e9a]/10 hover:border-[#009e9a]/50 target-landing-style'
)
content = content.replace(
    'rounded-3xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]',
    'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md'
)

# 6. Badges
content = content.replace(
    'bg-[#38BDF8] text-black border-4 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]',
    'bg-slate-900 text-white border-0 font-medium shadow-md shadow-slate-900/10'
)
content = content.replace(
    'bg-white text-black border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]',
    'bg-white text-slate-600 border border-slate-200 font-medium hover:border-primary/40 shadow-sm'
)

# Fix loading screen
content = content.replace(
    'bg-gradient-to-br from-primary to-blue-500 text-white shadow-2xl shadow-primary/40',
    'bg-gradient-to-br from-[#006664] to-[#009e9a] text-white shadow-xl shadow-primary/20'
)

with open("src/pages/Onboarding.tsx", "w") as f:
    f.write(content)
print("Updated successfully via python script inside kulifeos")
