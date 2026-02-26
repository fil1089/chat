import json
import re

def get_subcategory(id_lower, name_lower):
    # Thinking models
    if any(x in id_lower for x in [":thinking", "thinking", "reasoner", "/o1", "/o3"]):
        return "thinking"
    if " r1" in name_lower or "-r1" in id_lower:
        return "thinking"
    
    # Fast models
    if any(x in id_lower or x in name_lower for x in ["flash", "mini", "haiku", "nano", "fast", "lite"]):
        return "fast"
    
    # Default to advanced for remaining core models
    return "advanced"

def format_price(val):
    if val is None: return "0.00"
    try:
        # Round to 2 decimal places and add Ruble sign
        return f"{float(val):.2f}".replace('.', ',') + " \u20bd"
    except:
        return "0.00 \u20bd"

def process_models():
    with open("polza_models_v2.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    models = data.get("data", [])
    filtered = []
    
    # Brands requested: Anthropic, Google, DeepSeek, Mistral, xAI, Qwen, GLM, OpenAI
    brand_map = {
        "anthropic": "Claude",
        "google": "Gemini",
        "deepseek": "DeepSeek",
        "mistral": "Mistral",
        "x-ai": "Grok",
        "qwen": "Qwen",
        "z-ai": "GLM",
        "openai": "GPT"
    }
    
    for m in models:
        m_id = m.get("id", "")
        m_name = m.get("name", "")
        m_type = m.get("type", "")
        
        # Only chat models (or image models with text input)
        if m_type not in ["chat", "image"]: continue
        
        brand_key = m_id.split("/")[0]
        if brand_key not in brand_map: continue
        
        category = brand_map[brand_key]
        id_lower = m_id.lower()
        name_lower = m_name.lower()
        
        # OpenAI specific rules: Keep GPT-5, 5.1, 5.2, 4.1, 4o. Exclude dates in ().
        if category == "GPT":
            # Exclude models with dates in parentheses like (2024-...)
            if re.search(r"\(\d{4}-\d{2}-\d{2}\)", m_name) or re.search(r"-\d{4}-\d{2}-\d{2}", m_id):
                continue
            
            allowed_gpt = ["gpt-5", "gpt-5.1", "gpt-5.2", "gpt-4.1", "gpt-4o", "o1", "o3", "o4"]
            if not any(x in id_lower for x in allowed_gpt):
                continue

        # Prune common testing/distill models unless they are core
        if "nano-banana" in id_lower: continue
        
        # Pricing
        tp = m.get("top_provider", {})
        prices = tp.get("pricing", {})
        prompt_price = format_price(prices.get("prompt_per_million", 0))
        completion_price = format_price(prices.get("completion_per_million", 0))
        
        # Capabilities
        arch = m.get("architecture", {})
        inputs = arch.get("input_modalities", [])
        caps = {
            "text": "text" in inputs,
            "image": "image" in inputs,
            "file": "file" in inputs,
            "audio": "audio" in inputs,
            "video": "video" in inputs
        }
        
        # SubCategory
        sub_cat = get_subcategory(id_lower, name_lower)
        
        # Actual status
        is_actual = False
        if any(x in name_lower for x in ["o1", "o3", "4o", "3.7", "3.5 sonnet", "r1", "v3", "grok-2"]):
            is_actual = True
            
        desc = m.get("short_description") or f"Модель {m_name} от {category}."
        
        filtered.append({
            "id": m_id,
            "name": m_name,
            "category": category,
            "subCategory": sub_cat,
            "desc": desc,
            "isActual": is_actual,
            "pricing": {
                "prompt": prompt_price,
                "completion": completion_price
            },
            "capabilities": caps
        })

    # Sort: Category -> SubCategory (Thinking, Advanced, Fast) -> Name
    subcat_order = {"thinking": 0, "advanced": 1, "fast": 2}
    filtered.sort(key=lambda x: (x['category'], subcat_order.get(x['subCategory'], 9), x['name']))

    with open("polza_refined_list.ts", "w", encoding="utf-8") as f_out:
        f_out.write("export const POLZA_MODELS: AIModel[] = [\n")
        current_cat = None
        current_sub = None
        for m in filtered:
            if m['category'] != current_cat:
                f_out.write(f"\n    // ── {m['category']} ──\n")
                current_cat = m['category']
                current_sub = None
                
            if m['subCategory'] != current_sub:
                comment = "Рассуждающие" if m['subCategory'] == 'thinking' else "Продвинутые" if m['subCategory'] == 'advanced' else "Быстрые"
                f_out.write(f"    // {comment}\n")
                current_sub = m['subCategory']
            
            # Clean strings for TS
            d_val = m['desc'].replace("'", "\\'").replace("\n", " ")
            n_val = m['name'].replace("'", "\\'")
            
            line = f"    {{ id: '{m['id']}', name: '{n_val}', category: '{m['category']}', subCategory: '{m['subCategory']}', desc: '{d_val}', isActual: {str(m['isActual']).lower()}, "
            line += f"pricing: {{ prompt: '{m['pricing']['prompt']}', completion: '{m['pricing']['completion']}' }}, "
            line += f"capabilities: {json.dumps(m['capabilities'])} }},\n"
            f_out.write(line)
        f_out.write("];\n")
    
    print(f"Generated {len(filtered)} models in polza_refined_list.ts")

if __name__ == "__main__":
    process_models()
