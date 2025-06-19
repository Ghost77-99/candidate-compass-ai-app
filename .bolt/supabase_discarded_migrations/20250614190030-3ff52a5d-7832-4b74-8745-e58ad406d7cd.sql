
-- Insert sample job data
INSERT INTO public.jobs (title, company, description, location, job_type, experience_level, salary_min, salary_max, required_skills, posted_date, is_active) VALUES
('Senior Frontend Developer', 'TechCorp Solutions', 'We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for building user-friendly web applications using React, TypeScript, and modern CSS frameworks. The ideal candidate should have strong problem-solving skills and experience with responsive design.', 'San Francisco, CA', 'full_time', 'senior', 120000, 160000, ARRAY['React', 'TypeScript', 'CSS', 'JavaScript', 'Git'], '2025-06-10', true),

('Product Manager', 'Innovation Labs', 'Join our product team to drive the development of cutting-edge software solutions. You will work closely with engineering, design, and business teams to define product roadmaps and ensure successful product launches. Experience with agile methodologies and data analysis is preferred.', 'New York, NY', 'full_time', 'mid', 90000, 130000, ARRAY['Product Management', 'Agile', 'Data Analysis', 'Stakeholder Management'], '2025-06-11', true),

('Full Stack Developer', 'StartupXYZ', 'Exciting opportunity for a Full Stack Developer to work on innovative web applications. You will be involved in both frontend and backend development using modern technologies. We offer a collaborative environment with opportunities for growth and learning.', 'Austin, TX', 'full_time', 'mid', 85000, 115000, ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'], '2025-06-12', true),

('UX/UI Designer', 'Creative Agency Pro', 'We are seeking a talented UX/UI Designer to create intuitive and visually appealing user experiences. You will work on various projects ranging from web applications to mobile apps. Strong portfolio and experience with design tools like Figma and Adobe Creative Suite required.', 'Los Angeles, CA', 'full_time', 'mid', 70000, 95000, ARRAY['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Wireframing'], '2025-06-13', true),

('Backend Developer', 'CloudTech Inc', 'Join our backend team to build scalable and robust server-side applications. You will work with microservices architecture, APIs, and cloud technologies. Experience with Python, Django, and AWS is highly preferred.', 'Seattle, WA', 'full_time', 'senior', 110000, 140000, ARRAY['Python', 'Django', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes'], '2025-06-09', true),

('Marketing Intern', 'Digital Marketing Hub', 'Great opportunity for students or recent graduates to gain hands-on experience in digital marketing. You will assist with social media campaigns, content creation, and market research. This is a 3-month internship with potential for full-time conversion.', 'Remote', 'internship', 'entry', 15, 20, ARRAY['Social Media', 'Content Creation', 'Google Analytics', 'SEO'], '2025-06-14', true),

('DevOps Engineer', 'Infrastructure Solutions', 'We are looking for a DevOps Engineer to help manage our cloud infrastructure and deployment pipelines. You will work with CI/CD tools, monitoring systems, and automation scripts. Experience with AWS, Terraform, and Jenkins is required.', 'Denver, CO', 'full_time', 'senior', 115000, 145000, ARRAY['AWS', 'Terraform', 'Jenkins', 'Docker', 'Kubernetes', 'Linux'], '2025-06-08', true),

('Data Scientist', 'Analytics Pro', 'Join our data science team to extract insights from large datasets and build predictive models. You will work with machine learning algorithms, statistical analysis, and data visualization tools. PhD in related field preferred.', 'Boston, MA', 'full_time', 'senior', 130000, 170000, ARRAY['Python', 'R', 'Machine Learning', 'SQL', 'Pandas', 'Scikit-learn'], '2025-06-07', true);

-- Insert sample notifications for demonstration
INSERT INTO public.notifications (user_id, title, message, type, is_read) 
SELECT 
    id,
    'Welcome to TalentHub!',
    'Thank you for joining TalentHub. Complete your profile to get better job recommendations.',
    'info',
    false
FROM public.profiles 
WHERE role = 'user'
LIMIT 5;

INSERT INTO public.notifications (user_id, title, message, type, is_read)
SELECT 
    id,
    'New Job Opportunities',
    'Check out the latest job openings that match your skills and experience.',
    'info',
    false
FROM public.profiles 
WHERE role = 'user'
LIMIT 3;
