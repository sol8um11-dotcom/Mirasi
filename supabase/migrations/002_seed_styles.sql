-- Seed the 15 art styles
-- Prompt templates use {subject} placeholder for the uploaded image description

INSERT INTO styles (name, slug, category, description, short_description, prompt_template, negative_prompt, supports_dogs, supports_cats, supports_humans, region, display_order) VALUES

-- ROYAL (10)
(
  'Rajasthani Royal',
  'rajasthani-royal',
  'royal',
  'Inspired by the Mewar and Udaipur miniature painting tradition. Rich jewel tones, ornate borders, and regal palace settings.',
  'Mewar/Udaipur miniature portrait',
  'A portrait of {subject} in the style of Rajasthani Mewar miniature painting, ornate golden border, rich jewel tones of red and gold, palace courtyard background with arched pillars, detailed patterns, traditional Indian miniature art, flat perspective, highly detailed',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, temple, mosque',
  TRUE, TRUE, TRUE, 'Rajasthan', 1
),
(
  'Maratha Heritage',
  'maratha-heritage',
  'royal',
  'Inspired by Peshwa-era court portraiture. Bold compositions with deep maroon and gold, showcasing martial dignity.',
  'Peshwa-era court portrait',
  'A portrait of {subject} in the style of Maratha Peshwa era painting, bold composition, deep maroon and gold colors, fort rampart or durbar hall background, dignified and regal pose, traditional Indian painting style, detailed ornaments, flat perspective',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, temple, mosque',
  TRUE, TRUE, TRUE, 'Maharashtra', 2
),
(
  'Tanjore Heritage',
  'tanjore-heritage',
  'royal',
  'Inspired by the Thanjavur painting tradition. Rich colors with gold leaf embellishments, semi-classical South Indian style.',
  'Thanjavur painting with gold accents',
  'A portrait of {subject} in the style of Tanjore Thanjavur painting, rich vibrant colors, gold leaf embellishments, ornate arch frame, South Indian palace setting, detailed jewelry and ornaments, semi-classical Indian art style, warm lighting',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, temple interior, deity',
  TRUE, TRUE, TRUE, 'Tamil Nadu', 3
),
(
  'Mysore Palace',
  'mysore-palace',
  'royal',
  'Inspired by the Wodeyar court and Mysore painting tradition. Elegant compositions with muted gold and deep greens.',
  'Mysore/Wodeyar court style',
  'A portrait of {subject} in the style of Mysore painting tradition, elegant composition, muted gold tones with deep green accents, palatial Mysore palace interior background, refined brushwork, delicate details, South Indian royal court style',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, temple',
  TRUE, TRUE, TRUE, 'Karnataka', 4
),
(
  'Punjab Royal',
  'punjab-royal',
  'royal',
  'Inspired by Sikh court painting tradition. Vibrant colors with rich textiles and regal Lahore darbar settings.',
  'Sikh court painting style',
  'A portrait of {subject} in the style of Sikh court painting, vibrant rich colors, ornate textiles, Lahore darbar hall setting with pillars and chandeliers, regal pose, detailed turban and jewelry, traditional Punjabi royal art, warm golden lighting',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, Guru imagery, Ik Onkar, Khanda',
  TRUE, TRUE, TRUE, 'Punjab', 5
),
(
  'Bengal Renaissance',
  'bengal-renaissance',
  'royal',
  'Inspired by the Bengal School and Kalighat painting traditions. Soft wash technique with flowing lines and earthy palette.',
  'Bengal School wash painting',
  'A portrait of {subject} in the style of Bengal School painting, soft watercolor wash technique, flowing graceful lines, earthy and muted color palette, subtle golden undertones, atmospheric background, Abanindranath Tagore style, dreamy and poetic composition',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, harsh colors',
  TRUE, TRUE, TRUE, 'Bengal', 6
),
(
  'Kerala Mural',
  'kerala-mural',
  'royal',
  'Inspired by the Kerala Panchavarna mural tradition. Bold outlines, five primary colors, and temple art aesthetics.',
  'Kerala mural Panchavarna style',
  'A portrait of {subject} in the style of Kerala mural painting, bold black outlines, five primary colors (yellow ochre, red, green, blue, white), decorative floral borders, palace wall fresco style, traditional Indian mural art, flat perspective, ornate details',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, temple interior, deity figures',
  TRUE, TRUE, TRUE, 'Kerala', 7
),
(
  'Pahari Mountain',
  'pahari-mountain',
  'royal',
  'Inspired by Kangra and Basohli miniature painting traditions. Lyrical compositions with mountain landscapes and delicate detail.',
  'Kangra/Basohli miniature art',
  'A portrait of {subject} in the style of Pahari miniature painting, delicate brushwork, Kangra school lyrical composition, soft pastel colors with rich accents, Himalayan mountain landscape background, ornamental border, fine details, romantic and serene mood',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols',
  TRUE, TRUE, TRUE, 'Himachal Pradesh', 8
),
(
  'Deccani Royal',
  'deccani-royal',
  'royal',
  'Inspired by the Bijapur and Golconda painting traditions. Rich and luxurious with Persian-influenced compositions.',
  'Bijapur/Golconda court art',
  'A portrait of {subject} in the style of Deccani painting, Bijapur Golconda tradition, rich luxurious colors, Persian-influenced composition, ornate architectural background with domes and arches, gold accents, refined courtly style, detailed textile patterns',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, mosque interior',
  FALSE, TRUE, TRUE, 'Deccan', 9
),
(
  'Miniature Art',
  'miniature-art',
  'royal',
  'Inspired by the Indo-Islamic miniature painting tradition. Intricate detail, ornate borders, and classical compositions.',
  'Indo-Islamic miniature portrait',
  'A portrait of {subject} in the style of Indian miniature painting, intricate detailed brushwork, ornate decorative border with floral patterns, palace garden background, rich colors with gold accents, classical flat perspective, highly refined composition',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, mosque, temple',
  FALSE, TRUE, TRUE, 'Pan-Indian', 10
),

-- FOLK (3)
(
  'Madhubani Art',
  'madhubani-art',
  'folk',
  'Inspired by the Mithila painting tradition of Bihar. Geometric patterns, bold lines, and nature motifs.',
  'Mithila folk art portrait',
  'A portrait of {subject} in the style of Madhubani Mithila painting, bold black outlines, geometric patterns, nature motifs with fish and peacock borders, vibrant primary colors, folk art style, symmetrical composition, hand-painted texture, decorative background',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious symbols, deity',
  TRUE, TRUE, TRUE, 'Bihar', 11
),
(
  'Warli Art',
  'warli-art',
  'folk',
  'Inspired by the Warli tribal art of Maharashtra. Minimalist geometric figures on earthy terracotta backgrounds.',
  'Warli tribal art portrait',
  'A portrait of {subject} in the style of Warli tribal art, white geometric figures on terracotta brown background, stick figure folk art style, circular sun and triangular mountain motifs, minimalist composition, tribal dance border pattern, hand-painted texture',
  'modern, photorealistic, 3d render, cartoon, anime, colorful, blurry, low quality, watermark, text, religious symbols',
  TRUE, TRUE, TRUE, 'Maharashtra', 12
),
(
  'Pichwai Art',
  'pichwai-art',
  'folk',
  'Inspired by the Nathdwara temple painting tradition. Intricate lotus patterns, cows, and rich dark backgrounds.',
  'Nathdwara Pichwai style',
  'A portrait of {subject} in the style of Pichwai painting, intricate lotus flower patterns, rich dark blue or black background, detailed cow motifs in border, gold accents, Nathdwara tradition, ornate floral composition, traditional Indian textile art style',
  'modern, photorealistic, 3d render, cartoon, anime, blurry, low quality, watermark, text, religious deity, temple interior, Krishna',
  TRUE, TRUE, TRUE, 'Rajasthan', 13
),

-- MODERN (2)
(
  'Anime Portrait',
  'anime-portrait',
  'modern',
  'Japanese anime and manga inspired portrait style. Expressive eyes, vibrant colors, and dynamic composition.',
  'Anime/manga style portrait',
  'A portrait of {subject} in anime manga art style, expressive large eyes, vibrant colors, clean linework, dynamic composition, Studio Ghibli inspired background, soft lighting, detailed hair rendering, Japanese animation aesthetic',
  'photorealistic, blurry, low quality, watermark, text, deformed, ugly, bad anatomy, realistic, western cartoon',
  TRUE, TRUE, TRUE, 'Japan', 14
),
(
  'Bollywood Retro',
  'bollywood-retro',
  'modern',
  'Inspired by hand-painted Bollywood movie posters of the 1960s-80s. Dramatic compositions with vintage charm.',
  'Vintage Bollywood poster art',
  'A portrait of {subject} in the style of vintage hand-painted Bollywood movie poster from the 1970s, dramatic composition, bold saturated colors, painted brushstroke texture, retro Indian cinema aesthetic, dramatic lighting, stylized features, film poster layout',
  'modern, digital, 3d render, anime, blurry, low quality, watermark, text, photorealistic, plain background',
  TRUE, TRUE, TRUE, 'Bollywood', 15
);
