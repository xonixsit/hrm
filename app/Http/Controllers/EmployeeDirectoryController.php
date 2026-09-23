<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeDirectoryController extends Controller
{
    public function index()
    {
        $employees = [
            [
                'id' => 1,
                'name' => 'Mohd Naseer Uddin',
                'title' => 'Manager',
                'department' => 'Operations Management & Team Leadership',
                'color' => '#0d9488',
                'image' => '/images/management/naseer.jpg',
                'quote' => 'From Tax Analyst to Manager - A journey of dedication and growth',
                'intro' => 'I began my career with Xonobics IT Services Pvt. Ltd. in 2015 as a Tax Analyst, and over the past nine years, I\'ve had the privilege of evolving through multiple roles and responsibilities. Through dedication, consistency, and a commitment to excellence, I\'ve grown both professionally and personally within the organization.',
                'milestones' => [
                    ['year' => '2015', 'title' => 'Tax Analyst', 'description' => 'Started journey with Xonobics'],
                    ['year' => '2016', 'title' => 'Data Team', 'description' => 'Promoted to Data Team'],
                    ['year' => '2017', 'title' => 'Data In-charge', 'description' => 'Advanced to Data In-charge'],
                    ['year' => '2019', 'title' => 'Admin Department', 'description' => 'Transitioned into Admin Department'],
                    ['year' => '2020', 'title' => 'Assistant Manager', 'description' => 'Elevated to Assistant Manager'],
                    ['year' => '2022', 'title' => 'Manager', 'description' => 'Promotion to Manager role'],
                ],
                'career_story' => 'Starting as a Tax Analyst in 2015, I was promoted to the Data Team in 2016, and subsequently advanced to Data In-charge in 2017. In 2019, I transitioned into the Admin Department, and in 2020, I was elevated to Assistant Manager. My continued efforts and contributions led to my promotion as Manager in 2022, a role in which I currently oversee multiple functions, drive operational efficiency, and lead dynamic teams toward achieving organizational goals.',
                'leadership' => [
                    ['title' => 'Manager Role', 'description' => '2022 promotion overseeing multiple functions'],
                    ['title' => 'Operational Efficiency', 'description' => 'Driving efficiency and leading dynamic teams'],
                    ['title' => '10 Years of Growth', 'description' => 'Consistent progression through dedication'],
                ],
                'values' => [
                    ['title' => 'Dedication & Patience', 'description' => 'Foundation of hard work and perseverance'],
                    ['title' => 'Continuous Learning', 'description' => 'Passion for growth and new challenges'],
                    ['title' => 'Mentorship & Gratitude', 'description' => 'Valuing guidance rooted in transparency'],
                ],
                'future_vision' => 'Each phase of this journey has been an opportunity to embrace new challenges, enhance my leadership capabilities, and contribute meaningfully to the company\'s growth. I remain deeply grateful for the trust, support, and mentorship of my seniors, whose guidance—rooted in transparency, empowerment, and collaboration—has been instrumental in shaping my professional journey.',
                'future_commitment' => 'As I look toward the future, I remain steadfast in my pursuit of excellence. I am committed to further enhancing my skill set, taking on new challenges, and contributing to my organization\'s long-term success. Every step of this journey has fueled my passion for learning and growing.',
                'closing_note' => 'I look forward to what lies ahead as I continue to build on the foundation of dedication, patience, and hard work that has served me so well over these remarkable years.',
            ],
            [
                'id' => 2,
                'name' => 'Abdul Ateeq',
                'title' => 'Billing Head',
                'department' => 'Financial Operations & Process Excellence',
                'color' => '#0891b2',
                'image' => '/images/management/ateeq.jpg',
                'quote' => 'From Tax Analyst to Billing Head - A journey of growth and leadership',
                'intro' => 'I began my career with Xonobics IT Services Pvt. Ltd. in 2016 as a Tax Analyst, marking the beginning of a journey characterized by continuous growth, learning, and unwavering dedication. Over the years, I have progressed through multiple roles that have not only strengthened my professional expertise but also shaped my leadership capabilities.',
                'milestones' => [
                    ['year' => '2016', 'title' => 'Tax Analyst', 'description' => 'Started career with Xonobics'],
                    ['year' => '2017', 'title' => 'Query Manager', 'description' => 'Managing client queries and optimizing accuracy'],
                    ['year' => '2019-2022', 'title' => 'Dubai Branch', 'description' => 'Overseeing international financial operations'],
                    ['year' => '2022', 'title' => 'Billing Head', 'description' => 'Returned to India as Billing Head'],
                    ['year' => '2022', 'title' => 'Floor Manager', 'description' => 'Promoted to Floor Manager'],
                ],
                'career_story' => 'Starting as a Tax Analyst (2016), I was promoted to Query Manager (2017), where I took on broader responsibilities — managing client queries, optimizing accuracy, and enhancing overall process efficiency. In 2019, I was presented with the opportunity to work with our Dubai branch, where I spent three enriching years (2019–2022) overseeing financial operations, collaborating with international teams, and driving cross-border workflow efficiency.',
                'leadership' => [
                    ['title' => 'Query Manager (2017)', 'description' => 'Managing client queries and optimizing accuracy'],
                    ['title' => 'Dubai Branch (2019–2022)', 'description' => 'Overseeing international financial operations'],
                    ['title' => '9 Years of Growth', 'description' => 'Strengthened financial and communication skills'],
                ],
                'leadership_achievements' => [
                    ['title' => 'Billing Head (2022)', 'description' => 'Implemented automation and streamlined workflows'],
                    ['title' => 'Floor Manager (2022)', 'description' => 'Leading multiple teams and fostering collaboration'],
                    ['title' => 'Operational Excellence', 'description' => 'Ensuring smooth day-to-day operations'],
                ],
                'leadership_evolution' => 'Upon returning to India in 2022, I transitioned into the role of Billing Head, where I implemented automation initiatives and streamlined workflow systems to improve accuracy, transparency, and turnaround times. Later that same year, I was promoted to Floor Manager, a position in which I currently lead multiple teams, foster collaboration, and ensure smooth day-to-day operations aligned with organizational objectives.',
                'current_role' => 'As Floor Manager, I currently lead multiple teams, foster collaboration, and ensure smooth day-to-day operations aligned with organizational objectives. Every stage of this journey has been more than a title — it has been an opportunity to learn, adapt, and make meaningful contributions to the company\'s success.',
                'leadership_skills' => [
                    ['title' => 'Team Leadership', 'description' => 'Leading multiple teams with collaboration focus'],
                    ['title' => 'Process Optimization', 'description' => 'Ensuring smooth day-to-day operations'],
                    ['title' => 'Organizational Alignment', 'description' => 'Operations aligned with company objectives'],
                ],
                'values' => [
                    ['title' => 'Deep Gratitude', 'description' => 'For trust, mentorship, and guidance from leadership'],
                    ['title' => 'Continuous Learning', 'description' => 'Committed to ongoing professional development'],
                    ['title' => 'Operational Excellence', 'description' => 'Driving sustained growth and success'],
                ],
                'closing_note' => 'I am deeply grateful for the trust, mentorship, and guidance extended by the leadership team at Xonobics, whose support has been instrumental in my professional evolution. Looking ahead, I remain committed to continuous learning, operational excellence, and contributing to the sustained growth and success of Xonobics IT Services Pvt. Ltd.',
            ],
            [
                'id' => 3,
                'name' => 'Mohd Kashif',
                'title' => 'Business Manager',
                'department' => 'Strategic Execution & Leadership',
                'color' => '#b35a00',
                'image' => '/images/management/kashif.jpg',
                'quote' => 'From Tax Analyst to Business Manager - A journey of growth and dedication',
                'intro' => 'I began my journey with Xonobics IT Services in 2017 as a Tax Analyst. In my very first year, I successfully completed over 130 client files, earning recognition in the form of a mobile reward and a performance bonus. My consistent results and growing expertise led to my promotion to the Query Team, where I worked under the mentorship of Mr. Abdul Abdul Ateeq.',
                'milestones' => [
                    ['year' => '2017', 'title' => 'Tax Analyst', 'description' => 'Started journey with Xonobics'],
                    ['year' => '2018', 'title' => 'Query Team', 'description' => 'Promoted to Query Team under mentorship'],
                    ['year' => '2019', 'title' => 'Query Department Head', 'description' => 'Leading the department for one year'],
                    ['year' => '2020', 'title' => 'Billing Division', 'description' => 'Transitioned and promoted to Billing Head'],
                    ['year' => '2025', 'title' => 'Business Manager', 'description' => 'Supporting company growth through strategic execution'],
                ],
                'career_story' => 'My consistent results and growing expertise led to my promotion to the Query Team, where I worked under the mentorship of Mr. Abdul Abdul Ateeq. Through dedication and steady performance, I advanced to Query Department Head, managing and successfully closing more than 400 files.',
                'early_achievements' => [
                    ['title' => '130+ Client Files Completed', 'description' => 'First year performance milestone'],
                    ['title' => 'Mobile Reward & Performance Bonus', 'description' => 'Recognition for outstanding results'],
                ],
                'leadership' => [
                    ['title' => 'Query Department Head', 'description' => 'Leading the department for one year'],
                    ['title' => '400+ Files Managed', 'description' => 'Successfully closed under leadership'],
                    ['title' => 'Billing Division Transition', 'description' => 'Consistent performance targets achieved'],
                    ['title' => '8 Years of Excellence', 'description' => 'Outstanding achievements in performance'],
                ],
                'leadership_story' => 'After a year of leading the department, I transitioned into the Billing Division, where I consistently achieved performance targets and was soon promoted to Billing Head.',
                'current_role' => 'With each milestone, I took on broader responsibilities — from managing individual client files to overseeing business client operations and filings. My continuous progress and contribution to organizational goals led to my promotion as Business Manager, a role that allows me to support the company\'s growth through strategic execution and collaborative leadership.',
                'values' => [
                    ['title' => 'Supportive Environment', 'description' => 'Fair opportunities and transparent recognition'],
                    ['title' => 'Well-Structured Incentives', 'description' => 'Rewards effort and dedication'],
                    ['title' => 'Career Advancement', 'description' => 'Opportunities for continuous growth'],
                ],
                'company_excellence' => 'Xonobics is an ideal platform for beginners and professionals alike, offering hands-on experience, continuous learning, and exposure to multiple departments.',
                'key_strengths' => [
                    ['title' => 'Continuous Learning', 'description' => 'Hands-on experience and skill development'],
                    ['title' => 'Strong Management Support', 'description' => 'Guidance and mentorship throughout'],
                    ['title' => 'Culture of Growth', 'description' => 'Nurtures personal and professional development'],
                ],
                'closing_note' => 'With strong management support and a culture that nurtures both personal and professional growth, I take pride in being part of an organization that stands for integrity, innovation, and progress.',
                'footer_values' => ['Integrity', 'Innovation', 'Progress'],
            ],
            [
                'id' => 4,
                'name' => 'Mohammed Ghouse',
                'title' => 'Compliance Manager',
                'department' => 'Process Integrity & Team Leadership',
                'color' => '#1d4ed8',
                'image' => '/images/management/ghouse.jpg',
                'quote' => 'From Senior Analyst to Compliance Manager - A journey of trust and growth',
                'intro' => 'I joined Xonobics IT Services Pvt. Ltd. in October 2020 as a Senior Analyst and later took on the additional responsibility of leading a compliance team member. In April 2021, I was entrusted with additional responsibilities as a Billing Coordinator and CPA Coordinator, reflecting the organization\'s trust in my capability and commitment.',
                // Page 2: Team Growth & Contributions
                'team_growth_story' => 'Over the past five years, I have continued to manage these three key roles with dedication and adaptability. As the company grew, so did our Compliance team, expanding from a single member to a strong team of five professionals.',
                'team_expansion' => [
                    ['title' => 'From 1 to 5 Members', 'description' => 'Compliance team growth', 'icon' => 'users'],
                    ['title' => 'Five Years of Service', 'description' => 'Consistent dedication and adaptability', 'icon' => 'target'],
                ],
                'contributions_story' => 'Throughout my journey at Xonobics, I have also contributed to various strategic and operational roles beyond my core responsibilities to meet the organization\'s evolving needs.',
                'footer_values' => ['Growth', 'Leadership', 'Excellence'],
                // Page 3: Leadership Roles
                'leadership_roles_story' => 'In Tax Year 2022, I had the opportunity to lead as a Floor Manager, successfully managing a team of 60 members. Building on that experience, I was further elevated to the role of Production Manager in Tax Year 2023 and Tax Year 2024, where I oversaw the performance and development of our existing teams.',
                'leadership_milestones' => [
                    ['title' => 'Floor Manager - TY 2022', 'description' => 'Managing a team of 60 members', 'icon' => 'trophy'],
                    ['title' => 'Production Manager - TY 2023 & 2024', 'description' => 'Oversaw team performance and development', 'icon' => 'briefcase'],
                    ['title' => 'Progressive Leadership', 'description' => 'Building on experience for higher responsibilities', 'icon' => 'trending'],
                ],
                'leadership_closing' => 'Leading teams and driving organizational growth',
                // Page 4: Current Focus & Journey Reflection
                'current_focus_story' => 'At every stage, my focus has been on enhancing team efficiency, maintaining process integrity, and contributing to organizational growth. I continue to work closely with our internal teams to identify new business opportunities—leveraging our existing client base while guiding and mentoring new joinees to align with our company\'s growth vision.',
                'company_culture' => [
                    ['title' => 'Recognizing Potential', 'description' => 'Trust in capability and commitment', 'icon' => 'heart'],
                    ['title' => 'Encouraging Versatility', 'description' => 'Multiple roles and responsibilities', 'icon' => 'star'],
                    ['title' => 'Rewarding Performance', 'description' => 'Consistent recognition and growth', 'icon' => 'trophy'],
                ],
                'journey_reflection' => 'This journey at Xonobics reflects the company\'s culture of recognizing potential, encouraging versatility, and rewarding consistent performance.',
                'milestones' => [
                    ['year' => '2020', 'title' => 'Senior Analyst', 'description' => 'Joined Xonobics IT Services Pvt. Ltd.'],
                    ['year' => 'Apr 2021', 'title' => 'Billing & CPA Coordinator', 'description' => 'Entrusted with additional coordinator responsibilities'],
                    ['year' => 'TY 2022', 'title' => 'Floor Manager', 'description' => 'Led a team of 60 members'],
                    ['year' => 'TY 2023–24', 'title' => 'Production Manager', 'description' => 'Oversaw team performance and development'],
                ],
                'career_story' => 'Starting as a Senior Analyst in October 2020, I quickly took on compliance leadership responsibilities. By April 2021, I was managing three key roles simultaneously — Compliance, Billing Coordinator, and CPA Coordinator. Over the next five years, I grew both my team and my leadership scope significantly.',
                'leadership' => [
                    ['title' => 'Compliance Manager', 'description' => 'Overseeing all compliance functions'],
                    ['title' => 'Billing & CPA Coordinator', 'description' => 'Dual coordinator responsibilities from April 2021'],
                    ['title' => '5 Years of Excellence', 'description' => 'Consistent dedication and adaptability'],
                ],
            ],
            [
                'id' => 5,
                'name' => 'Edupuganti Jitendra Kamal Chowdary',
                'title' => 'Query Head',
                'department' => 'Leadership & Process Optimization',
                'color' => '#1d4ed8',
                'image' => '/images/management/jitendra.jpg',
                'quote' => 'Every query resolved is a step toward operational perfection',
                'intro' => 'I joined Xonobics IT Services on February 7, 2022, as a Tax Analyst, beginning a journey marked by continuous growth, learning, and leadership development. My early focus was on mastering tax research, compliance workflows, and client communication, which laid a strong foundation for advancement within the organization.',
                // Page 2: From Analyst to Leadership
                'leadership_milestones' => [
                    ['title' => 'Senior Tax Analyst', 'description' => 'Promoted within two years for accuracy and excellence', 'icon' => 'trophy'],
                    ['title' => 'Team Lead', 'description' => 'Advanced for initiative and reliability', 'icon' => 'document'],
                    ['title' => 'Query Head', 'description' => 'Current role overseeing department operations', 'icon' => 'target'],
                ],
                'analyst_to_leadership_story' => 'Within two years, I was promoted to Senior Tax Analyst in recognition of my consistent accuracy and commitment to excellence. Demonstrating initiative and reliability, I advanced to Team Lead, where I managed a high-performing team, coordinated complex case assignments, and ensured timely, error-free delivery of tax filings and advisory reports.',
                'analyst_to_leadership_story2' => 'Continuing to exceed expectations, I was elevated to Query Head, where I now oversee the Query Department and drive strategic improvements across all operational functions.',
                // Page 3: As Team Lead
                'team_lead_achievements' => [
                    ['title' => 'Structured Review Processes', 'description' => 'Reduced review errors significantly', 'icon' => 'shield'],
                    ['title' => 'Knowledge-Sharing Sessions', 'description' => 'Enhanced onboarding efficiency', 'icon' => 'bulb'],
                    ['title' => 'Client Coordination', 'description' => 'Resolved escalations and maintained communication', 'icon' => 'users'],
                ],
                'team_lead_story' => 'As Team Lead, I implemented structured review processes and knowledge-sharing sessions that reduced review errors and enhanced onboarding efficiency for new hires. I also played a key role in client coordination — resolving escalations, clarifying technical positions, and maintaining strong communication channels with senior tax advisors.',
                // Page 4: Query Head Role
                'query_head_achievements' => [
                    ['title' => 'Improved Response Times', 'description' => 'Through data-driven insights and optimization', 'icon' => 'trending'],
                    ['title' => 'Enhanced Quality Metrics', 'description' => 'Higher first-contact resolution rates', 'icon' => 'target'],
                    ['title' => 'Strategic Prioritization', 'description' => 'Standardized response templates and monitoring', 'icon' => 'crown'],
                ],
                'query_head_story' => 'After two successful years in leadership, I was promoted to Query Head, where I currently oversee the Query Department. My responsibilities include strategic prioritization, standardization of response templates, performance monitoring, and cross-functional collaboration.',
                'query_head_footer' => ['Strategy', 'Optimization', 'Results'],
                // Page 5: Department Oversight
                'dept_oversight_responsibilities' => [
                    ['title' => 'Strategic Prioritization', 'description' => 'Managing department workflows effectively', 'icon' => 'document'],
                    ['title' => 'Process Optimization', 'description' => 'Data-driven improvements and standardization', 'icon' => 'bulb'],
                    ['title' => 'Cross-Functional Collaboration', 'description' => 'Working across teams for better outcomes', 'icon' => 'users'],
                ],
                'dept_oversight_story' => 'Through data-driven insights and process optimization, I have successfully improved response times, quality metrics, and first-contact resolution rates across the department. My role involves overseeing all aspects of Query Department operations with a focus on excellence and efficiency.',
                // Page 6: Mentoring & Development
                'leadership_philosophy' => [
                    ['title' => 'Accuracy & Accountability', 'description' => 'Core principles of professional excellence', 'icon' => 'heart'],
                    ['title' => 'Continuous Improvement', 'description' => 'Fostering a culture of learning', 'icon' => 'star'],
                    ['title' => 'People-Oriented Leadership', 'description' => 'Supporting team growth and collaboration', 'icon' => 'users'],
                ],
                'mentoring_story' => 'Beyond operational excellence, I actively mentor team members in technical skills, client handling, and regulatory updates. My leadership philosophy centers on accuracy, accountability, and continuous improvement, fostering a culture of learning and collaboration that aligns with Xonobics\' mission of reliability and innovation.',
                // Page 7: Commitment to Excellence
                'future_commitments' => [
                    ['title' => 'Process Refinement', 'description' => 'Continuing to optimize workflows and systems', 'icon' => 'target'],
                    ['title' => 'Team Upskilling', 'description' => 'Developing team capabilities and knowledge', 'icon' => 'bulb'],
                    ['title' => 'Client Value Delivery', 'description' => 'Delivering unmatched value to clients', 'icon' => 'trophy'],
                ],
                'commitment_story' => 'I firmly believe that career advancement at Xonobics is earned through consistent performance, proactive problem-solving, and people-oriented leadership. I look forward to continuing my contribution to the company\'s growth by refining processes, upskilling teams, and delivering unmatched value to our clients.',
                'milestones' => [
                    ['year' => '2022', 'title' => 'Tax Analyst', 'description' => 'Joined Xonobics IT Services'],
                    ['year' => '2024', 'title' => 'Senior Tax Analyst', 'description' => 'Promoted for accuracy and commitment to excellence'],
                    ['year' => '2024', 'title' => 'Team Lead', 'description' => 'Advanced for initiative and reliability'],
                    ['year' => '2025', 'title' => 'Query Head', 'description' => 'Elevated to oversee Query Department operations'],
                ],
                'career_story' => 'Starting as a Tax Analyst in February 2022, I quickly distinguished myself through consistent accuracy and proactive problem-solving. Within two years I advanced to Senior Tax Analyst, then Team Lead, and was ultimately elevated to Query Head — overseeing the full Query Department with a focus on process excellence.',
                'leadership' => [
                    ['title' => 'Query Head', 'description' => 'Overseeing all Query Department operations'],
                    ['title' => 'Process Excellence', 'description' => 'Standardizing response templates and monitoring'],
                    ['title' => '3+ Years of Impact', 'description' => 'Consistent growth and operational leadership'],
                ],
                'values' => [
                    ['title' => 'Accuracy & Accountability', 'description' => 'Core principles of professional excellence'],
                    ['title' => 'Continuous Improvement', 'description' => 'Fostering a culture of learning and innovation'],
                    ['title' => 'Client Value Delivery', 'description' => 'Delivering unmatched value to clients'],
                ],
                'closing_note' => 'With dedication and clear communication, every challenge becomes an opportunity for operational refinement.',
            ],
            [
                'id' => 6,
                'name' => 'Vepuri Jesse Mike Gill Christ',
                'title' => 'Trainer',
                'department' => 'Compliance & Quality Training',
                'color' => '#0e7490',
                'image' => '/images/management/mike.jpg',
                'quote' => 'From Tax Analyst to Trainer - A journey of dedication and excellence',
                'intro' => 'Vepuri Jesse Mike Gill Christ is a dedicated and performance-driven professional at Xonobics IT Services, contributing significantly to the E-Tax Planner process. He began his journey with the company on December 4, 2022, and his unwavering commitment brought him back on January 2, 2023, reaffirming his long-term association with Xonobics.',
                // Page 2: Career Milestones
                'career_milestones' => [
                    ['title' => 'Tax Analyst', 'description' => 'Starting role demonstrating discipline and adaptability', 'icon' => 'trophy'],
                    ['title' => 'Quality Analyst', 'description' => 'Advanced for exceptional performance and attention to detail', 'icon' => 'document'],
                    ['title' => 'Trainer', 'description' => 'Current role in Compliance Handling and Quality Analysis', 'icon' => 'target'],
                ],
                'career_milestone_story' => 'Starting as a Tax Analyst, Jesse quickly stood out for his discipline, adaptability, and analytical approach. His exceptional performance and attention to detail led to steady career growth—from Tax Analyst to Quality Analyst, and later to Trainer for Compliance Handling and Quality Analysis. In his current role, he ensures compliance standards, data integrity, and operational accuracy while guiding his team toward continuous improvement.',
                // Page 3: Recognition & Awards
                'awards' => [
                    ['title' => 'Employee Recognition Certificates', 'description' => 'Multiple certificates for outstanding contributions', 'icon' => 'certificate'],
                    ['title' => 'Best Employee Award', 'description' => 'Recognition for exemplary performance', 'icon' => 'trophy'],
                    ['title' => 'Leadership Excellence', 'description' => 'Exemplifying accountability and passion for excellence', 'icon' => 'star'],
                ],
                'awards_story' => 'Recognized with multiple Employee Recognition Certificates and the Best Employee Award, Jesse exemplifies leadership, accountability, and a passion for excellence. His strong command of MS Word, Excel, and data analytics tools, combined with a proactive mentoring approach, has helped new employees integrate effectively and perform confidently.',
                // Page 4: Technical Proficiency
                'technical_skills' => [
                    ['title' => 'MS Office Suite', 'description' => 'Advanced proficiency in Word, Excel, and data analytics', 'icon' => 'academic'],
                    ['title' => 'Data Analytics', 'description' => 'Strong analytical skills and data integrity focus', 'icon' => 'bulb'],
                    ['title' => 'Mentoring Excellence', 'description' => 'Proactive approach to employee development', 'icon' => 'users'],
                ],
                'technical_story' => 'His strong command of MS Word, Excel, and data analytics tools, combined with a proactive mentoring approach, has helped new employees integrate effectively and perform confidently. Jesse\'s commitment to employee development ensures smooth onboarding and sustained performance across the team.',
                'technical_footer' => ['Skills', 'Mentoring', 'Development'],
                'milestones' => [
                    ['year' => 'Dec 2022', 'title' => 'Tax Analyst', 'description' => 'Began journey at Xonobics IT Services'],
                    ['year' => 'Jan 2023', 'title' => 'Rejoined Xonobics', 'description' => 'Reaffirmed long-term commitment to the company'],
                    ['year' => '—', 'title' => 'Quality Analyst', 'description' => 'Promoted for exceptional performance and attention to detail'],
                    ['year' => 'Current', 'title' => 'Trainer', 'description' => 'Leading Compliance Handling and Quality Analysis'],
                ],
                'career_story' => 'Starting as a Tax Analyst, Jesse quickly stood out for his discipline and analytical approach. Steady career growth took him from Tax Analyst to Quality Analyst, and ultimately to Trainer—where he now leads compliance and quality training for the team.',
                'leadership' => [
                    ['title' => 'Trainer', 'description' => 'Compliance Handling and Quality Analysis'],
                    ['title' => 'Quality Analyst', 'description' => 'Advanced for exceptional performance and detail'],
                    ['title' => 'Best Employee Award', 'description' => 'Recognition for exemplary contribution'],
                ],
                'values' => [
                    ['title' => 'Discipline & Adaptability', 'description' => 'Core strengths driving consistent performance'],
                    ['title' => 'Data Integrity', 'description' => 'Ensuring compliance standards and accuracy'],
                    ['title' => 'Mentoring & Development', 'description' => 'Guiding team toward continuous improvement'],
                ],
                'closing_note' => 'From Tax Analyst to Trainer — a journey of dedication and excellence.',
            ],
            [
                'id' => 8,
                'name' => 'Vishal Manohar',
                'title' => 'Billing Team Leader',
                'department' => 'Tax & Billing Leadership',
                'color' => '#0284c7',
                'image' => '/images/vishal.jpg',
                'quote' => 'From Tax Analyst to Billing Team Leader - A journey of growth and leadership',
                'intro' => 'I began my career with Xonobics IT Services Pvt. Ltd. in January 2023 as a Tax Analyst, bringing a different professional background with limited experience in U.S. taxation. The transition was challenging, but I was eager to learn and committed to growing within the field.',
                'early_career' => [
                    'badge' => 'EARLY CAREER DEVELOPMENT',
                    'subheader' => 'Vishal Manohar - From Tax Analyst to Senior Tax Analyst',
                    'title' => 'Career Milestones',
                    'items' => [
                        ['title' => 'Tax Analyst (2023)', 'description' => 'Building foundational tax knowledge and skills', 'icon' => 'trophy'],
                        ['title' => 'Senior Tax Analyst (2025)', 'description' => 'Focusing on complex tax processes and leadership', 'icon' => 'trending'],
                        ['title' => '2 Years of Growth', 'description' => 'Overcoming challenges and honing expertise', 'icon' => 'target'],
                    ],
                    'story' => 'After two years of honing my skills as a Tax Analyst, I was promoted to Senior Tax Analyst, where I began to focus more on complex aspects of tax processes. The transition presented significant challenges due to my limited prior experience in U.S. taxation, but my eagerness to learn and commitment to growth drove me forward.',
                ],
                'expanding_horizons' => [
                    'badge' => 'EXPANDING HORIZONS',
                    'subheader' => 'Vishal Manohar - Billing Department Integration',
                    'title' => 'Billing Integration',
                    'items' => [
                        ['title' => 'Key Billing Role', 'description' => 'Taking on billing responsibilities as part of management commitment', 'icon' => 'bulb'],
                        ['title' => 'Operational Insights', 'description' => 'Gaining valuable insights into company operations', 'icon' => 'users'],
                        ['title' => 'Perspective Broadening', 'description' => 'Significantly broadening professional perspective', 'icon' => 'target'],
                    ],
                    'story' => 'During this time, I also took on a key role in the billing department as part of my commitment to management. My experience in billing allowed me to gain valuable insights into the company\'s operations, which significantly broadened my professional perspective and enhanced my understanding of the business as a whole.',
                ],
                'professional_growth' => [
                    'badge' => 'PROFESSIONAL GROWTH',
                    'subheader' => 'Vishal Manohar - Deepening Expertise',
                    'title' => 'Expertise Development',
                    'items' => [
                        ['title' => 'Tax & Billing Mastery', 'description' => 'Deep understanding of both tax and billing functions', 'icon' => 'academic'],
                        ['title' => 'Cross-Functional Skills', 'description' => 'Growing ability to manage cross-functional tasks', 'icon' => 'users'],
                        ['title' => 'Operational Excellence', 'description' => 'Ensuring smooth operations and efficiency', 'icon' => 'target'],
                    ],
                    'story' => 'Over the next few seasons, I gained a deep understanding of both tax and billing functions, and my ability to manage cross-functional tasks continued to grow. This period of expansion allowed me to contribute more effectively to the organization\'s success while building a comprehensive skill set.',
                ],
                'current_leadership' => [
                    'badge' => 'CURRENT LEADERSHIP',
                    'subheader' => 'Vishal Manohar - Billing Team Leadership',
                    'title' => 'Leadership Responsibilities',
                    'items' => [
                        ['title' => 'Team Leadership', 'description' => 'Overseeing the billing team and ensuring smooth operations', 'icon' => 'crown'],
                        ['title' => 'Operational Management', 'description' => 'Maintaining efficiency and effectiveness in billing processes', 'icon' => 'users'],
                        ['title' => 'Strategic Oversight', 'description' => 'Aligning billing operations with organizational goals', 'icon' => 'target'],
                    ],
                    'story' => 'Currently, I serve as the Billing Team Leader, where I oversee the billing team and ensure smooth operations. This role allows me to apply my comprehensive understanding of tax and billing functions while leading a team toward achieving operational excellence.',
                ],
                'gratitude_future' => [
                    'badge' => 'GRATITUDE & FUTURE',
                    'subheader' => 'Vishal Manohar - Commitment to Excellence',
                    'title' => 'Professional Values',
                    'items' => [
                        ['title' => 'Deep Gratitude', 'description' => 'For trust, mentorship, and guidance from leadership', 'icon' => 'heart'],
                        ['title' => 'Continuous Learning', 'description' => 'Committed to ongoing professional development', 'icon' => 'star'],
                        ['title' => 'Future Leadership', 'description' => 'Leading teams toward greater results', 'icon' => 'trophy'],
                    ],
                    'story' => 'The support and mentorship from management have been invaluable in my development, both professionally and personally. I\'m proud of the journey I\'ve taken so far and the growth I\'ve achieved. Looking ahead, I\'m excited to continue advancing within the company and contributing to its success. With the experience and leadership skills I\'ve developed, I\'m confident in my ability to lead my team toward achieving even greater results in the future.',
                ],
            ],
            [
                'id' => 7,
                'name' => 'Gogunta Mani',
                'title' => 'Sr. Tax Analyst',
                'department' => 'Finance & Taxation',
                'color' => '#047857',
                'image' => '/images/mani.jpg',
                'quote' => 'Precision in taxation is the foundation of financial trust',
                'intro' => 'I joined Xonobics in February 2023 as a Sr. Tax Analyst, bringing specialized expertise in taxation and financial compliance. My focus has been on ensuring accurate tax computations, maintaining regulatory compliance, and supporting the financial health of the organization.',
                'milestones' => [
                    ['year' => '2023', 'title' => 'Sr. Tax Analyst', 'description' => 'Joined Xonobics leading tax analysis and compliance'],
                    ['year' => '2024', 'title' => 'Tax Compliance', 'description' => 'Established systematic approaches to tax filing and computation'],
                    ['year' => '2025', 'title' => '2+ Years of Excellence', 'description' => 'Delivering consistent financial precision'],
                ],
                'career_story' => 'Since joining Xonobics in 2023, I have taken ownership of the tax analysis function, establishing systematic approaches to tax computation, filing, and compliance. My expertise in taxation has helped the organization navigate complex regulatory requirements while optimizing financial outcomes.',
                'leadership' => [
                    ['title' => 'Sr. Tax Analyst', 'description' => 'Leading tax analysis and compliance'],
                    ['title' => 'Tax Compliance', 'description' => 'Ensuring regulatory adherence'],
                    ['title' => '2+ Years of Excellence', 'description' => 'Consistent analytical performance'],
                ],
                'values' => [
                    ['title' => 'Financial Precision', 'description' => 'Ensuring 100% accuracy in tax computations and reporting'],
                    ['title' => 'Regulatory Mastery', 'description' => 'Staying ahead of evolving tax laws and policies'],
                    ['title' => 'Strategic Optimization', 'description' => 'Maximizing financial integrity through meticulous compliance'],
                ],
                'future_vision' => 'The field of taxation is constantly evolving, and staying ahead requires continuous learning and adaptation. At Xonobics, I have found a supportive environment that encourages professional development.',
                'future_commitment' => 'My vision is to further deepen my tax expertise, explore advanced areas of financial planning, and contribute to building a tax function that serves as a strategic asset.',
                'closing_note' => 'Meticulous analysis and unwavering accuracy pave the path to financial clarity and organizational strength.',
            ],
        ];

        return Inertia::render('EmployeeDirectory/Index', [
            'employees' => $employees,
        ]);
    }
}
