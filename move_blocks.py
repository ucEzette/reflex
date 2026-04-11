import re

file_path = "frontend/src/app/(dashboard)/market/[product]/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# 1. Remove "Live Pool Metrics" block
# It starts at {/* ── Live Pool Metrics ── */}
# and ends right before {/* ── How This Model Works ── */}
start_pool = text.find("{/* ── Live Pool Metrics ── */}")
end_pool = text.find("{/* ── How This Model Works ── */}")

if start_pool != -1 and end_pool != -1:
    # remove the block entirely
    text = text[:start_pool] + text[end_pool:]
    print("Removed pool metrics.")

# 2. Remove open attribute from <details>
text = text.replace('<details className="bg-surface-container-low rounded-xl p-8 specular-border group" open>',
                    '<details className="bg-surface-container-low rounded-xl p-8 specular-border group">')

# 3. Move "Configure Protection" block
# Starts at "          {/* ─── Configure Protection ─── */}"
start_config = text.find("          {/* ─── Configure Protection ─── */}")
end_config_block = text.find("        {/* ═════════ RIGHT COLUMN — Purchase Terminal ═════════ */}")

if start_config != -1 and end_config_block != -1:
    config_block = text[start_config:end_config_block]
    text = text[:start_config] + text[end_config_block:]
    
    # insert config_block directly before Resolution Rules
    res_rules_start = text.find("{/* ── Resolution Rules ── */}")
    if res_rules_start != -1:
        text = text[:res_rules_start] + config_block + "\n          " + text[res_rules_start:]
        print("Moved configure protection.")

with open(file_path, "w") as f:
    f.write(text)

print("Done")
