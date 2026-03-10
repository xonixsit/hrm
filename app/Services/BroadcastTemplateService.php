<?php

namespace App\Services;

class BroadcastTemplateService
{
    public static function getTemplates()
    {
        return [
            'new_year' => [
                'title' => 'Happy New Year 2025!',
                'type' => 'wish',
                'email_template' => 'festive',
                'content' => "Dear Team,

As we step into the New Year 2025, we want to take a moment to express our heartfelt gratitude for your dedication, hard work, and commitment throughout the past year.

The New Year brings new opportunities, fresh perspectives, and exciting challenges. We look forward to achieving new milestones together and continuing our journey of growth and success.

May this New Year bring you joy, prosperity, and fulfillment both personally and professionally.

Wishing you and your loved ones a very Happy New Year!

Best regards,
Management Team",
                'notes' => 'New Year celebration message for all employees'
            ],
            'republic_day' => [
                'title' => 'Happy Republic Day - Celebrating Our Nation',
                'type' => 'announcement',
                'email_template' => 'professional',
                'content' => "Dear Team,

On this auspicious occasion of Republic Day, we celebrate the spirit of our great nation and the values that bind us together - justice, liberty, equality, and fraternity.

As we honor our Constitution and the sacrifices of our freedom fighters, let us also reflect on our role as responsible citizens and professionals who contribute to the nation's progress.

Today, we take pride in being part of an organization that upholds these democratic values and works towards the betterment of society.

Let us continue to work together with the same spirit of unity and dedication that our founding fathers envisioned for our nation.

Jai Hind!

Warm regards,
Management Team",
                'notes' => 'Republic Day celebration message'
            ],
            'independence_day' => [
                'title' => 'Happy Independence Day - Freedom and Unity',
                'type' => 'announcement',
                'email_template' => 'professional',
                'content' => "Dear Team,

On this glorious Independence Day, we celebrate 78 years of freedom, democracy, and progress. This day reminds us of the countless sacrifices made by our freedom fighters to give us the liberty we enjoy today.

As we hoist our tricolor flag, let us remember that freedom comes with responsibility. Each one of us has a role to play in building a stronger, more prosperous nation.

At our organization, we are proud to contribute to India's growth story through our work, innovation, and commitment to excellence.

Let us pledge to continue working towards a better tomorrow for our country and future generations.

Happy Independence Day!

Jai Hind!

Best wishes,
Management Team",
                'notes' => 'Independence Day celebration message'
            ],
            'diwali' => [
                'title' => 'Happy Diwali - Festival of Lights',
                'type' => 'wish',
                'email_template' => 'festive',
                'content' => "Dear Team,

As we celebrate Diwali, the festival of lights, we extend our warmest wishes to you and your families. May this auspicious occasion bring joy, prosperity, and happiness to your homes.

Diwali symbolizes the victory of light over darkness, good over evil, and knowledge over ignorance. It's a time for new beginnings, strengthening relationships, and spreading joy.

Just as we light diyas to illuminate our homes, let us also light up our workplace with positivity, collaboration, and shared success.

May Goddess Lakshmi bless you with wealth, health, and happiness. May this Diwali mark the beginning of a prosperous year ahead.

Wishing you and your loved ones a very Happy Diwali!

Warm regards,
Management Team",
                'notes' => 'Diwali festival wishes for all employees'
            ],
            'holi' => [
                'title' => 'Happy Holi - Festival of Colors',
                'type' => 'wish',
                'email_template' => 'celebration',
                'content' => "Dear Team,

As we celebrate Holi, the vibrant festival of colors, we wish you and your families a joyous and colorful celebration!

Holi represents the triumph of good over evil, the arrival of spring, and the joy of togetherness. It's a time to forget differences, forgive past grievances, and strengthen bonds with friends and colleagues.

Just as colors blend beautifully during Holi, our diverse team comes together to create something beautiful and meaningful in our workplace.

May this festival fill your life with bright colors of joy, happiness, success, and prosperity.

Let's celebrate the spirit of unity and spread happiness all around!

Happy Holi!

Best wishes,
Management Team",
                'notes' => 'Holi festival celebration message'
            ],
            'eid' => [
                'title' => 'Eid Mubarak - Blessed Festival',
                'type' => 'wish',
                'email_template' => 'celebration',
                'content' => "Dear Team,

On this blessed occasion of Eid, we extend our heartfelt wishes to you and your families. Eid Mubarak!

Eid is a time of joy, reflection, and gratitude. It celebrates the completion of the holy month of Ramadan and reminds us of the values of compassion, generosity, and unity.

As we come together to celebrate this auspicious festival, let us embrace the spirit of giving, sharing, and caring for one another.

May this Eid bring peace, happiness, and prosperity to your lives. May Allah's blessings be with you and your loved ones always.

Eid Mubarak to all our Muslim colleagues and their families!

Warm regards,
Management Team",
                'notes' => 'Eid festival wishes for Muslim employees'
            ],
            'christmas' => [
                'title' => 'Merry Christmas - Season of Joy',
                'type' => 'wish',
                'email_template' => 'festive',
                'content' => "Dear Team,

As we celebrate Christmas, we want to extend our warmest wishes to you and your families. Merry Christmas!

Christmas is a time of joy, love, and giving. It's a season that brings families together and reminds us of the importance of kindness, compassion, and generosity.

This festive season, let us cherish the moments with our loved ones and spread happiness wherever we go. May the spirit of Christmas fill your hearts with peace and your homes with joy.

We are grateful for your continued dedication and hard work throughout the year. Your efforts have made our organization stronger and more successful.

May this Christmas bring you wonderful memories, and may the New Year ahead be filled with new opportunities and achievements.

Merry Christmas and Happy Holidays!

Best wishes,
Management Team",
                'notes' => 'Christmas celebration wishes'
            ],
            'womens_day' => [
                'title' => "International Women's Day - Celebrating Our Women Leaders",
                'type' => 'announcement',
                'email_template' => 'professional',
                'content' => "Dear Team,

On this International Women's Day, we celebrate and honor the incredible women in our organization who inspire us every day with their strength, wisdom, and leadership.

Women's Day is not just about celebrating achievements, but also about recognizing the ongoing journey towards gender equality and empowerment in the workplace and society.

To all the amazing women in our team - thank you for your dedication, innovation, and the unique perspectives you bring to our organization. Your contributions are invaluable and deeply appreciated.

To our male colleagues - let us continue to support and champion gender equality, creating an inclusive environment where everyone can thrive.

Together, we can build a more equitable and inclusive workplace for all.

Happy International Women's Day!

Best regards,
Management Team",
                'notes' => "International Women's Day celebration message"
            ],
            'work_anniversary' => [
                'title' => 'Celebrating Our Team - Work Anniversary',
                'type' => 'announcement',
                'email_template' => 'professional',
                'content' => "Dear Team,

Today, we celebrate a special milestone - the work anniversary of our valued team members who have been with us for another year of dedication and excellence.

Your commitment, hard work, and loyalty have been instrumental in our organization's growth and success. Each year of service represents not just time spent, but relationships built, challenges overcome, and achievements unlocked together.

We are grateful for your continued contribution and look forward to many more years of collaboration and shared success.

Thank you for being an integral part of our journey. Here's to celebrating your dedication and looking forward to the exciting opportunities ahead!

Congratulations on your work anniversary!

Best regards,
Management Team",
                'notes' => 'Work anniversary celebration template'
            ],
            'quarterly_update' => [
                'title' => 'Quarterly Update - Our Progress Together',
                'type' => 'update',
                'email_template' => 'minimal',
                'content' => "Dear Team,

As we conclude another successful quarter, we want to share some exciting updates and achievements that we've accomplished together.

This quarter has been marked by significant milestones, innovative solutions, and outstanding teamwork. Your dedication and hard work have been the driving force behind our continued success.

Key Highlights:
• [Add specific achievements]
• [Add performance metrics]
• [Add upcoming initiatives]

Looking ahead, we have exciting projects and opportunities that will further strengthen our position and create new possibilities for growth.

Thank you for your continued commitment and excellence. Together, we're building something remarkable.

Best regards,
Management Team",
                'notes' => 'Quarterly business update template'
            ]
        ];
    }

    public static function getTemplate($key)
    {
        $templates = self::getTemplates();
        return $templates[$key] ?? null;
    }

    public static function getTemplateCategories()
    {
        return [
            'festivals' => [
                'label' => 'Festival Celebrations',
                'templates' => ['new_year', 'diwali', 'holi', 'eid', 'christmas']
            ],
            'national' => [
                'label' => 'National Occasions',
                'templates' => ['republic_day', 'independence_day']
            ],
            'special' => [
                'label' => 'Special Occasions',
                'templates' => ['womens_day', 'work_anniversary']
            ],
            'business' => [
                'label' => 'Business Updates',
                'templates' => ['quarterly_update']
            ]
        ];
    }
}