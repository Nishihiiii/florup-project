INSERT INTO public.plants (name, latin_name, description, care_watering_text, care_lighting_text, care_temp_text, water_interval_days, fertilize_interval_days, is_verified)
SELECT 'Сансевиерия', 'Dracaena trifasciata', 'Неприхотливое комнатное растение с плотными вертикальными листьями. Подходит начинающим цветоводам.', 'Поливайте после полного просыхания грунта. Зимой полив сокращают.', 'Яркий рассеянный свет или полутень; избегайте длительного палящего солнца.', 'Обычно 18–27 °C; берегите от холодных сквозняков.', 14, 45, true
WHERE NOT EXISTS (SELECT 1 FROM public.plants WHERE lower(name) = lower('Сансевиерия'));

INSERT INTO public.problem_types (name) VALUES ('Вредители') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.plant_problems (problem_type_id, name, description, treatment)
SELECT pt.id, 'Паутинный клещ', 'Мелкие светлые точки на листьях, тонкая паутина и постепенное пожелтение. Чаще появляется при сухом воздухе.', 'Изолируйте растение, промойте листья и обработайте подходящим средством от клещей по инструкции. Повторно осматривайте растение и соседние цветы.'
FROM public.problem_types pt WHERE pt.name = 'Вредители'
AND NOT EXISTS (SELECT 1 FROM public.plant_problems WHERE name = 'Паутинный клещ');
