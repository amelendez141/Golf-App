import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { Navbar } from '@/components/layout/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient grain-overlay" />

        <Container className="relative">
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 md:py-32 lg:py-40 text-center px-2 sm:px-0">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 max-w-4xl leading-tight">
              Find Your{' '}
              <span className="text-accent">Foursome.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-10 max-w-2xl px-2 leading-relaxed">
              Connect with professionals in your industry over a round of golf.
              Discover open tee times, join groups, and build meaningful relationships on the course.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button
                  variant="accent"
                  size="xl"
                  className="w-full sm:min-w-[200px]"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:min-w-[200px] border-white/30 text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Container>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F5F0E8"
            />
          </svg>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-12 sm:py-20 md:py-28">
        <Container>
          <div className="text-center mb-10 sm:mb-16 px-2">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Golf is better with the right partners
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
              Whether you&apos;re looking to network, make new friends, or simply fill that fourth spot,
              LinkUp connects you with like-minded golfers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <ValuePropCard
              icon={<NetworkIcon />}
              title="Industry Networking"
              description="Connect with professionals in finance, tech, legal, healthcare, and more. Find golfers who understand your world."
            />
            <ValuePropCard
              icon={<CalendarIcon />}
              title="Easy Scheduling"
              description="Browse open tee times, see who's playing, and join with one click. No more awkward solo rounds or empty foursome slots."
            />
            <ValuePropCard
              icon={<MapIcon />}
              title="Discover Courses"
              description="Explore courses near you with our interactive map. Filter by price, type, and availability to find your perfect round."
            />
          </div>
        </Container>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 sm:py-20 md:py-28 bg-card">
        <Container>
          <div className="text-center mb-10 sm:mb-16 px-2">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Trusted by professionals
            </h2>
            <p className="text-text-secondary text-base sm:text-lg">
              Join thousands of golfers who&apos;ve found their perfect playing partners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <TestimonialCard
              quote="Finally, a way to meet other finance professionals on the course. Made three great connections in my first month."
              author="Michael R."
              role="Investment Banker"
              industry="Finance"
            />
            <TestimonialCard
              quote="As someone new to the city, LinkUp helped me find a regular group of tech folks to play with every weekend."
              author="Sarah L."
              role="Product Manager"
              industry="Tech"
            />
            <TestimonialCard
              quote="The industry filtering is brilliant. I've built more relationships on the golf course than at any conference."
              author="David K."
              role="Partner"
              industry="Legal"
            />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 md:py-28 px-4 sm:px-0">
        <Container size="md">
          <div className="bg-primary rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center grain-overlay relative overflow-hidden">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 relative z-10">
              Ready to find your foursome?
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto relative z-10">
              Join LinkUp today and start connecting with professionals who share your passion for golf.
            </p>
            <div className="relative z-10">
              <Link href="/sign-up">
                <Button variant="accent" size="xl" className="w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-primary/5">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <GolfIcon className="h-8 w-8 text-primary" />
              <span className="font-serif text-xl font-semibold text-primary">
                LinkUp
              </span>
            </div>
            <p className="text-text-muted text-sm">
              &copy; {new Date().getFullYear()} LinkUp Golf. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

function ValuePropCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-card hover:shadow-card-hover transition-shadow touch-manipulation active:scale-[0.99]">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary/5 flex items-center justify-center mb-4 sm:mb-6 text-primary">
        {icon}
      </div>
      <h3 className="font-serif text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-3">{title}</h3>
      <p className="text-text-secondary text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  industry,
}: {
  quote: string;
  author: string;
  role: string;
  industry: string;
}) {
  return (
    <div className="bg-secondary rounded-xl sm:rounded-2xl p-5 sm:p-8">
      <div className="mb-4 sm:mb-6">
        <QuoteIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent/30" />
      </div>
      <p className="text-text-secondary mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-medium text-primary text-sm sm:text-base">{author}</p>
        <p className="text-xs sm:text-sm text-text-muted">
          {role} &bull; {industry}
        </p>
      </div>
    </div>
  );
}

function GolfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}
