import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, BarChart, MessageCircle, Rocket, Shield, Globe, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface WhyChooseUsProps {
  onNavigate: (path: string) => void;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onNavigate }) => {
  const { language } = useTheme();

  const reasons = [
    {
      icon: Brain,
      title: 'AI-Powered Smart Learning',
      titleAr: 'تعلم ذكي بالذكاء الاصطناعي',
      description: 'Our advanced AI explains lessons in simple ways, adapts to your level, and helps you truly understand — not just memorize.',
      descriptionAr: 'يشرح الذكاء الاصطناعي المتقدم لدينا الدروس بطرق بسيطة، ويتكيف مع مستواك، ويساعدك على الفهم حقًا - وليس مجرد الحفظ.',
      color: 'blue',
    },
    {
      icon: Zap,
      title: 'Instant Homework Help',
      titleAr: 'مساعدة فورية في الواجبات',
      description: 'Stuck on a problem? Get step-by-step explanations instantly and learn how to solve it on your own.',
      descriptionAr: 'هل تواجه مشكلة؟ احصل على شرح خطوة بخطوة على الفور وتعلم كيفية حلها بنفسك.',
      color: 'indigo',
    },
    {
      icon: Target,
      title: 'Personalized Study Plans',
      titleAr: 'خطة مذاكرة مخصصة',
      description: 'The app builds a smart study schedule based on your goals, weak points, and available time.',
      descriptionAr: 'يقوم التطبيق ببناء جدول دراسي ذكي بناءً على أهدافك ونقاط ضعفك ووقتك المتاح.',
      color: 'purple',
    },
    {
      icon: BarChart,
      title: 'Progress Tracking',
      titleAr: 'متابعة التقدم',
      description: 'Track your performance, identify weak areas, and improve faster with smart analytics.',
      descriptionAr: 'تتبع أدائك، وحدد مناطق الضعف، وتحسن بشكل أسرع باستخدام التحليلات الذكية.',
      color: 'pink',
    },
    {
      icon: MessageCircle,
      title: '24/7 AI Study Assistant',
      titleAr: 'مساعد دراسي 24/7',
      description: 'Ask unlimited questions anytime and get clear, accurate answers instantly.',
      descriptionAr: 'اطرح أسئلة غير محدودة في أي وقت واحصل على إجابات واضحة ودقيقة على الفور.',
      color: 'blue',
    },
    {
      icon: Rocket,
      title: 'Boost Productivity',
      titleAr: 'زيادة الإنتاجية',
      description: 'Stay focused with smart reminders, study timers, and distraction-free learning tools.',
      descriptionAr: 'ابق مركزًا مع التذكيرات الذكية، ومؤقتات الدراسة، وأدوات التعلم الخالية من التشتت.',
      color: 'indigo',
    },
  ];

  return (
      <section className="py-32 bg-[#050505] relative overflow-hidden">
        {/* Lando-style background glows */}
        <div className="absolute top-1/2 left-0 w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[150px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
              className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
          >
            <div>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6">
                THE CORE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 font-black">ADVANTAGE</span>
              </h2>
              <p className="text-gray-400 font-bold max-w-xl text-lg leading-relaxed">
                {language === 'en' 
                  ? "Experience the future of academic performance. Precision-engineered for students who demand excellence."
                  : "جرب مستقبل الأداء الأكاديمي. تم تصميمه بدقة للطلاب الذين يطمحون للتميز."}
              </p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Performance Metrics</p>
              <div className="flex gap-2 justify-end">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1.5 h-6 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, index) => (
                <motion.div
                    key={index}
                    className="bg-[#0D0D0D]/80 backdrop-blur-xl rounded-[3rem] border border-white/5 p-10 hover:border-blue-500/30 transition-all duration-500 group relative"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                >
                  <div className="absolute top-8 right-8 text-[10px] font-black text-gray-800 tracking-widest uppercase">
                    MOD: 0{index + 1}
                  </div>

                  <motion.div
                      className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-500"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                  >
                    <reason.icon className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors" />
                  </motion.div>

                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">
                    {language === 'en' ? reason.title : reason.titleAr}
                  </h3>

                  <p className="text-gray-400 leading-relaxed font-medium">
                    {language === 'en' ? reason.description : reason.descriptionAr}
                  </p>

                  <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-8 h-[1px] bg-blue-500" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Optimizing Engine</span>
                  </div>
                </motion.div>
            ))}
          </div>

          <motion.div
              className="text-center mt-24"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
          >
            <motion.button
                className="bg-white text-black px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/10 hover:bg-blue-600 hover:text-white transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('dashboard')}
            >
              <span className="flex items-center gap-3 italic">
                {language === 'en' ? 'Initialize Enrollment' : 'بدء الالتحاق الآن'}
                <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </motion.button>
            <p className="mt-6 text-gray-600 font-black text-[10px] uppercase tracking-[0.4em]">5,000+ Units Deployed Globally</p>
          </motion.div>
        </div>
      </section>
  );
};

export default WhyChooseUs;
