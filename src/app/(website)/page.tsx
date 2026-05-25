// import Category from "./_components/landing-page/category";
import HowItWorks from "./_components/landing-page/how-it-works";
import NewsLetterSubscription from "./_components/landing-page/newsletter-Subscription";
import SportsArticles from "./_components/landing-page/sports-articles";
import UpcomingTournaments from "./_components/landing-page/upcoming-tournaments";
import Banner from "./_components/re-usable/banner";

export default function Home() {
  return (
    <div className="space-y-24">
      <Banner
        bannerURL="/images/landing-page/hero.jpg"
        title="Top scorer to the final match"
        desc="Experience the thrill of knockout golf tournaments. Track your progress, compete with the best, and claim victory."
        buttonTitle="Join Tournament"
        buttonPath="/tournaments"
      />

      <div className="container mx-auto space-y-24">
        <HowItWorks />
        {/* <Category /> */}
        <UpcomingTournaments />
        <SportsArticles />
        <NewsLetterSubscription />
      </div>
    </div>
  );
}
