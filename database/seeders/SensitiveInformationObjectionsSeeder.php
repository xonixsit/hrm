<?php

namespace Database\Seeders;

use App\Models\ObjectionCard;
use App\Models\ResponseCard;
use Illuminate\Database\Seeder;

class SensitiveInformationObjectionsSeeder extends Seeder
{
    public function run(): void
    {
        $objections = [
            [
                'objection_text' => "I'm not comfortable sharing my birthdate. Why do you need that?",
                'category' => 'privacy',
                'difficulty' => 'medium',
                'tips' => 'Explain legal requirements and data protection measures',
                'responses' => [
                    [
                        'response_text' => "I completely understand your concern about privacy. Your birthdate is required by the IRS for identity verification on tax amendments. We're legally required to include it on Form 1040-X. Rest assured, we use bank-level encryption and are bound by strict confidentiality laws. Your information is never shared with third parties.",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "That's fine, we can skip it and process your amendment without it.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "I don't want to give you my Social Security Number. Can't you use something else?",
                'category' => 'privacy',
                'difficulty' => 'hard',
                'tips' => 'Emphasize IRS requirements and security protocols',
                'responses' => [
                    [
                        'response_text' => "I appreciate your caution - protecting your SSN is important. Unfortunately, the IRS mandates that all tax amendments include your SSN as the primary taxpayer identifier. Without it, the IRS will reject the amendment. We protect your SSN with 256-bit encryption, secure servers, and strict access controls. We're also required by law to safeguard your information under federal privacy regulations.",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "You're right to be concerned. Let me just use your driver's license number instead.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "Why do you need copies of my W-2s and 1099s? I already filed my taxes.",
                'category' => 'trust',
                'difficulty' => 'medium',
                'tips' => 'Explain the amendment verification process',
                'responses' => [
                    [
                        'response_text' => "Great question! For tax amendments, we need to verify the original information that was filed and compare it to the corrections. Your W-2s and 1099s help us ensure accuracy and provide documentation if the IRS has questions. These documents also protect you by creating a clear paper trail. We'll securely store them and only use them for your amendment processing.",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "You're right, we don't really need those. Just tell me what was on them and we'll proceed.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "I don't want to provide my home address. Can I use a P.O. Box?",
                'category' => 'privacy',
                'difficulty' => 'easy',
                'tips' => 'Explain IRS mailing requirements',
                'responses' => [
                    [
                        'response_text' => "I understand your privacy concerns. The IRS requires your physical home address on Form 1040-X for official correspondence and verification purposes. However, you can use a P.O. Box as your mailing address for receiving correspondence. We'll need both - your physical address for the form and your P.O. Box for mail delivery. This way, you maintain privacy while meeting IRS requirements.",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "Sure, a P.O. Box works fine. We'll just use that for everything.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "I've heard about identity theft. How do I know my information is safe with you?",
                'category' => 'trust',
                'difficulty' => 'medium',
                'tips' => 'Detail security measures and credentials',
                'responses' => [
                    [
                        'response_text' => "That's a very valid concern, and I'm glad you're being cautious. We take data security extremely seriously. We use military-grade encryption, secure cloud storage with redundant backups, multi-factor authentication, and regular security audits. Our staff undergoes background checks and annual security training. We're also IRS-authorized e-file providers and comply with all federal data protection regulations. Additionally, we carry cyber liability insurance and have never had a data breach in our history.",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "Don't worry about it - we've been doing this for years and nothing bad has happened yet.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "Can't I just file the amendment myself without giving you all this personal information?",
                'category' => 'value',
                'difficulty' => 'medium',
                'tips' => 'Highlight expertise and error prevention',
                'responses' => [
                    [
                        'response_text' => "Absolutely, you have the right to file your own amendment! However, tax amendments are complex - the IRS rejects about 20% of self-filed amendments due to errors. Our expertise helps you avoid costly mistakes, ensures you claim all eligible deductions, and handles IRS correspondence if questions arise. We also guarantee our work. While you'll need to provide information either way (to us or directly to the IRS), working with us means professional review, accuracy, and peace of mind. Would you like to hear about our satisfaction guarantee?",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "Sure, you can do it yourself. We're just here if you need us.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "I don't trust giving my bank account information for direct deposit. Can you mail me a check?",
                'category' => 'privacy',
                'difficulty' => 'easy',
                'tips' => 'Offer alternatives while explaining benefits',
                'responses' => [
                    [
                        'response_text' => "I completely understand - many clients prefer paper checks for peace of mind. You have three options: direct deposit (fastest, 2-3 weeks), paper check to your address (4-6 weeks), or you can leave the refund method blank and the IRS will automatically mail you a check. Direct deposit is more secure than mail since checks can be lost or stolen, but the choice is entirely yours. Which option would you prefer?",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "We require direct deposit for all refunds. It's company policy.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "Why do you need my spouse's information if I'm the one with the error?",
                'category' => 'trust',
                'difficulty' => 'medium',
                'tips' => 'Explain joint filing requirements',
                'responses' => [
                    [
                        'response_text' => "Excellent question! If you filed jointly, the IRS considers both spouses equally responsible for the entire return. Any amendment to a joint return requires both spouses' information and signatures, even if the error only affects one person's income. This protects both of you legally. If your spouse is unwilling to sign, you may need to file an 'Injured Spouse' claim or amend as 'Married Filing Separately,' which we can help you evaluate.",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "You're right, we only need your information since it's your error. We can leave your spouse out of it.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "I don't want to upload documents to your website. Can I mail them instead?",
                'category' => 'privacy',
                'difficulty' => 'easy',
                'tips' => 'Offer multiple secure options',
                'responses' => [
                    [
                        'response_text' => "Of course! We offer several secure options for your convenience: encrypted upload through our secure portal, mail to our office with tracking, secure fax, or in-person drop-off at our office. While our encrypted portal is the fastest and most secure method (documents can't be lost in transit), we're happy to accommodate your preference. Which method would work best for you?",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "We only accept electronic uploads. It's the only way we process documents now.",
                        'is_correct' => false
                    ]
                ]
            ],
            [
                'objection_text' => "What happens to my information after you're done with my amendment?",
                'category' => 'privacy',
                'difficulty' => 'medium',
                'tips' => 'Explain retention policies and client rights',
                'responses' => [
                    [
                        'response_text' => "Great question - transparency is important. We're required by law to retain your tax records for 7 years in case of IRS audit or questions. Your information remains in our secure, encrypted system during this time. After 7 years, we securely destroy all documents using certified shredding services. You can request copies of your records anytime, and you can also request early destruction after 3 years if you sign a waiver. We never sell or share your information with third parties, and you can review our full privacy policy anytime.",
                        'is_correct' => true
                    ],
                    [
                        'response_text' => "We keep it in our files indefinitely. You never know when you might need it again.",
                        'is_correct' => false
                    ]
                ]
            ]
        ];

        foreach ($objections as $objectionData) {
            $responses = $objectionData['responses'];
            unset($objectionData['responses']);

            $objection = ObjectionCard::create($objectionData);

            foreach ($responses as $responseData) {
                ResponseCard::create([
                    'objection_id' => $objection->id,
                    'response_text' => $responseData['response_text'],
                    'is_correct' => $responseData['is_correct']
                ]);
            }
        }

        $this->command->info('Added 10 sensitive information objections with responses.');
    }
}
