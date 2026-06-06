import re
import sys
import os

def check_word_bank_bugs(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all WORD_BANK slides
    word_bank_pattern = r'<div class="slide" data-type="WORD_BANK">.*?</div>\s*</div>'
    slides = re.findall(word_bank_pattern, content, re.DOTALL)
    
    bugs = []
    for slide_idx, slide in enumerate(slides):
        # Extract word bank items
        words = re.findall(r'<span data-se-word>([^<]+)</span>', slide)
        words_lower = [w.lower().strip() for w in words]
        
        # Extract blanks and their answers
        blanks = re.findall(r'<span data-se-blank data-se-answer="([^"]+)"', slide)
        
        for blank_answer in blanks:
            blank_answer_lower = blank_answer.lower().strip()
            if blank_answer_lower not in words_lower:
                # Found a mismatch!
                # Get line number
                slide_start = content.find(slide)
                line_num = content[:slide_start].count('\n') + 1
                bugs.append(f"  Line ~{line_num}: Answer '{blank_answer}' not in word bank")
    
    return bugs

# Check all WORD_BANK files
for file in sys.argv[1:]:
    if os.path.exists(file):
        bugs = check_word_bank_bugs(file)
        if bugs:
            print(f"{file}:")
            for bug in bugs:
                print(bug)
