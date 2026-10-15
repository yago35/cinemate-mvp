"use client"

import { useState, useEffect } from "react"
import { X, ShieldAlert, FileText, Lock, Globe, Film, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type LegalTab = "terms" | "privacy"
export type LegalLang = "tr" | "en"

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: LegalTab
}

export function LegalModal({ isOpen, onClose, initialTab = "terms" }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab)
  const [lang, setLang] = useState<LegalLang>("tr")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [isOpen, initialTab])

  if (!isOpen && !visible) return null

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div 
        className={cn(
          "relative z-[121] flex h-full max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-all duration-300",
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-rate-green/15 text-rate-green">
              {activeTab === "terms" ? <FileText className="size-5" /> : <Lock className="size-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight text-foreground">
                {activeTab === "terms" 
                  ? (lang === "tr" ? "Kullanım Şartları" : "Terms of Service") 
                  : (lang === "tr" ? "Gizlilik Politikası ve Sorumluluk Reddi" : "Privacy Policy & Disclaimer")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {lang === "tr" ? "Cinemate Yasal Bilgilendirme" : "Cinemate Legal Information"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "tr" ? "en" : "tr")}
              className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Dili Değiştir / Change Language"
            >
              <Globe className="size-3.5" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-secondary/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab("terms")}
            className={cn(
              "relative pb-3 pt-2 text-sm font-semibold transition-colors mr-6",
              activeTab === "terms" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {lang === "tr" ? "Kullanım Şartları" : "Terms of Use"}
            {activeTab === "terms" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-rate-green" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={cn(
              "relative pb-3 pt-2 text-sm font-semibold transition-colors",
              activeTab === "privacy" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {lang === "tr" ? "Gizlilik & Sorumluluk Reddi" : "Privacy & Disclaimer"}
            {activeTab === "privacy" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-rate-green" />
            )}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-muted-foreground space-y-6">
          {/* Universal Disclaimer Banner (Always shown at top for high legal compliance) */}
          <div className="rounded-2xl border border-rate-orange/30 bg-rate-orange/10 p-4 text-foreground/90">
            <div className="flex items-start gap-3">
              <ShieldAlert className="size-5 shrink-0 text-rate-orange mt-0.5" />
              <div className="space-y-1.5 text-xs leading-relaxed">
                <p className="font-semibold text-rate-orange uppercase tracking-wider text-[11px]">
                  {lang === "tr" ? "Resmi Sorumluluk Reddi / Official Disclaimer" : "Official Disclaimer"}
                </p>
                <p>
                  {lang === "tr" ? (
                    <>
                      <strong>Letterboxd:</strong> Cinemate, bağımsız bir sosyal eşleşme projesidir ve <strong>Letterboxd Limited</strong> ile herhangi bir resmi ortaklığı, sponsorluğu, lisans sözleşmesi veya bağlılığı <u>bulunmamaktadır</u>. Letterboxd ismi, logoları ve ilgili tüm ticari markalar Letterboxd Limited&apos;a aittir.
                    </>
                  ) : (
                    <>
                      <strong>Letterboxd:</strong> Cinemate is an independent project and is <u>not affiliated, associated, authorized, endorsed by, or in any way officially connected</u> with <strong>Letterboxd Limited</strong> or any of its subsidiaries or affiliates.
                    </>
                  )}
                </p>
                <p>
                  {lang === "tr" ? (
                    <>
                      <strong>TMDB (The Movie Database):</strong> Bu uygulama TMDB API&apos;sini kullanmaktadır ancak TMDB tarafından onaylanmamış veya sertifikalandırılmamıştır (<em>This product uses the TMDB API but is not endorsed or certified by TMDB</em>). Film verileri, afişler ve metadata kamuya açık TMDB API servisleri aracılığıyla temin edilmektedir.
                    </>
                  ) : (
                    <>
                      <strong>TMDB:</strong> This product uses the TMDB API but is not endorsed or certified by TMDB. Film metadata and poster imagery are sourced through TMDB public APIs.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {activeTab === "terms" ? (
            /* TERMS OF SERVICE CONTENT */
            lang === "tr" ? (
              <div className="space-y-5 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">1. Hizmetin Niteliği ve Kabul</h3>
                  <p>
                    Cinemate, sinema tutkunlarının ortak zevkler ve Letterboxd verileri üzerinden tanışmasını, sohbet etmesini ve film önerileri paylaşmasını amaçlayan bağımsız bir platformdur. Uygulamamıza kayıt olarak veya giriş yaparak bu şartları bütünüyle kabul etmiş sayılırsınız.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">2. Yaş Sınırı ve Uygunluk</h3>
                  <p>
                    Cinemate&apos;i kullanabilmek için en az <strong>18 yaşında</strong> olmanız gerekmektedir. 18 yaşın altındaki bireylerin hesap oluşturması kesinlikle yasaktır.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">3. Topluluk ve Davranış Kuralları</h3>
                  <p className="mb-2">
                    Güvenli ve saygılı bir sinemasever topluluğu oluşturmak birincil önceliğimizdir. Aşağıdaki eylemler kesinlikle yasaktır ve hesabın derhal kapatılmasına neden olur:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Taciz, nefret söylemi, ayrımcılık veya tehditkar davranışlarda bulunmak,</li>
                    <li>Müstehcen, izinsiz veya yanıltıcı profil fotoğrafları yüklemek,</li>
                    <li>Başkalarını taklit etmek veya yetkisiz olarak üçüncü şahıslara ait Letterboxd hesaplarını bağlamak,</li>
                    <li>Spam, reklam veya ticari kazanç amaçlı faaliyetlerde bulunmak.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">4. Kullanıcı Güvenliği ve Buluşmalar</h3>
                  <p>
                    Kullanıcılar arasındaki yazışmalar, paylaşılan kişisel bilgiler ve gerçek hayatta gerçekleşebilecek olası buluşmalar tamamen kullanıcıların kendi iradesi ve sorumluluğundadır. Cinemate, kullanıcılar arasındaki iletişim ve eylemlerden ötürü hukuki veya cezai bir sorumluluk kabul etmez. Her zaman kişisel güvenliğinizi ön planda tutmanızı tavsiye ederiz.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">5. Fikri Mülkiyet</h3>
                  <p>
                    Cinemate arayüzü, logoları ve tasarımı Cinemate ekibine aittir. Letterboxd ve TMDB ticari markaları, ilgili hak sahiplerinin mülkiyetindedir ve yalnızca atıf/tanımlama amacıyla referans verilmiştir.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">6. Şartlarda Değişiklik ve Hesap Feshi</h3>
                  <p>
                    Cinemate, bu şartları önceden bildirmeksizin güncelleme ve kuralları ihlal eden hesapları tek taraflı olarak askıya alma veya kalıcı olarak silme hakkını saklı tutar.
                  </p>
                </div>
              </div>
            ) : (
              /* TERMS IN ENGLISH */
              <div className="space-y-5 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">1. Acceptance of Terms</h3>
                  <p>
                    Cinemate is an independent dating and social discovery platform designed to connect film lovers based on shared Letterboxd tastes and cinematic preferences. By creating an account or accessing the service, you agree to be bound by these Terms of Use.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">2. Age Requirement</h3>
                  <p>
                    You must be at least <strong>18 years of age</strong> to create an account and use Cinemate. Any use of the platform by individuals under 18 is strictly prohibited.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">3. Community Standards & Conduct</h3>
                  <p className="mb-2">
                    We are dedicated to providing a safe, respectful environment for cinephiles. The following behaviors are strictly prohibited and may result in immediate suspension:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Harassment, stalking, hate speech, or discriminatory language,</li>
                    <li>Uploading explicit, offensive, or unauthorized profile imagery,</li>
                    <li>Impersonation or linking Letterboxd accounts that do not belong to you,</li>
                    <li>Spam, commercial solicitation, or unauthorized scraping.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">4. Safety & Offline Meetups</h3>
                  <p>
                    You are solely responsible for your interactions with other members, both on the app and in person. Cinemate does not conduct criminal background checks and cannot guarantee user authenticity. Always exercise caution and prioritize personal safety.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">5. Intellectual Property</h3>
                  <p>
                    Cinemate branding and design belong to the Cinemate team. Letterboxd and TMDB trademarks belong to their respective holders and are used strictly under fair descriptive attribution.
                  </p>
                </div>
              </div>
            )
          ) : (
            /* PRIVACY POLICY & DISCLAIMER CONTENT */
            lang === "tr" ? (
              <div className="space-y-5 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">1. Toplanan Bilgiler</h3>
                  <p className="mb-2">
                    Cinemate, size en uygun film partnerini bulabilmek için aşağıdaki asgari verileri işler:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Hesap Bilgileri:</strong> Giriş için kullandığınız e-posta adresi ve şifrelenmiş kimlik bilgisi.</li>
                    <li><strong>Letterboxd Kamuya Açık Verileri:</strong> Belirttiğiniz Letterboxd kullanıcı adı, herkese açık film izleme geçmişi (diary/RSS) ve favori 4 film listesi. Şifreniz asla istenmez veya saklanmaz.</li>
                    <li><strong>Profil Bilgileri:</strong> İsim, yaş, biyografi, yüklediğiniz fotoğraflar ve cinsiyet/tercih bilgisi.</li>
                    <li><strong>Konum Bilgisi:</strong> Tercih ettiğiniz arama mesafesi ve şehir/bölge bilgisi (cihazınızın hassas GPS koordinatları üçüncü şahıslarla paylaşılmaz).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">2. Verilerin Kullanım Amacı</h3>
                  <p>
                    Toplanan veriler yalnızca sinematik uyumluluk skorunuzu hesaplamak, ilgi alanlarınıza göre eşleşme kartları oluşturmak ve eşleştiğiniz kullanıcılarla mesajlaşmanızı sağlamak amacıyla kullanılır. Verileriniz hiçbir koşulda reklam şirketlerine veya üçüncü taraflara satılmaz.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">3. Letterboxd & TMDB Veri Entegrasyonu</h3>
                  <p>
                    Letterboxd verileri, kullanıcı tarafından sağlanan kamuya açık kullanıcı adının herkese açık RSS akışları üzerinden anlık olarak okunur. Film afişleri, özetleri ve teknik detayları ise The Movie Database (TMDB) açık API hizmeti kullanılarak zenginleştirilmektedir.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">4. Veri Saklama ve Güvenlik</h3>
                  <p>
                    Kişisel verileriniz modern şifreleme standartlarına uygun altyapıda saklanır. Cihazınızda oturum durumu ve tercihlerinizi hatırlamak için yerel tarayıcı depolaması (Local Storage/Cookies) kullanılabilir.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">5. Kullanıcı Hakları ve Veri Silme Talebi</h3>
                  <p>
                    Dilediğiniz an &quot;Ayarlar&quot; bölümünden hesabınızı sıfırlayabilir veya destek ekibimize başvurarak tüm profil ve eşleşme geçmişinizin sistemden kalıcı olarak silinmesini talep edebilirsiniz.
                  </p>
                </div>
              </div>
            ) : (
              /* PRIVACY POLICY IN ENGLISH */
              <div className="space-y-5 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">1. Information We Collect</h3>
                  <p className="mb-2">
                    To connect you with compatible film lovers, Cinemate processes minimal necessary information:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Account Credentials:</strong> Email address and authentication token.</li>
                    <li><strong>Letterboxd Public Data:</strong> Your public Letterboxd username, publicly logged films (via RSS), ratings, and favorite picks. We never request or store your Letterboxd password.</li>
                    <li><strong>Profile Data:</strong> Name, age, uploaded photos, bio, and dating preferences.</li>
                    <li><strong>Approximate Location:</strong> City or distance radius for radius-based matching.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">2. How We Use Data</h3>
                  <p>
                    Your data is solely used to calculate cinematic compatibility scores, show swipe profiles, and enable direct messaging between matches. We never sell your personal information to third parties or data brokers.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">3. Third-Party Integrations</h3>
                  <p>
                    Public Letterboxd data is retrieved through standard public web feeds. Movie posters and metadata are fetched using the public TMDB API. Neither service endorses or certifies this product.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">4. Data Deletion & Your Rights</h3>
                  <p>
                    You have full control over your information. You can reset your demo data or request permanent deletion of your account and records at any time through the Settings menu.
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-rate-green shrink-0" />
            <span>{lang === "tr" ? "Son güncelleme: Ekim 2026" : "Last updated: October 2026"}</span>
          </div>

          <button
            onClick={handleClose}
            className="rounded-full bg-rate-green px-5 py-2 text-xs sm:text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {lang === "tr" ? "Anladım ve Kapat" : "I Understand & Close"}
          </button>
        </div>
      </div>
    </div>
  )
}
