import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const MissionVision = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* mission section */}
      <section className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center lg:items-start">
        <div className="w-full lg:w-1/2">
          <Image
            src={"/images/about/mission.jpg"}
            alt="Mission image"
            width={1000}
            height={1000}
            className="w-full h-auto max-w-full lg:max-w-none rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="w-full lg:w-1/2 lg:flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-hexco text-center lg:text-left">
            <span className="text-primary">Our </span>Mission
          </h1>

          <div className="text-sm sm:text-base text-gray-500 mt-4 sm:mt-6 space-y-4 sm:space-y-5">
            <p>
              We believe that golf is more than just a sport it&apos;s a test of
              precision, patience, and passion. Every swing tells a story, and
              every player deserves a fair, transparent, and professionally
              managed tournament experience that honors the spirit of the game.
            </p>

            <p>
              At our core, we&apos;re driven by a single vision to transform how
              golf tournaments are organized, played, and experienced.
              We&apos;re building a platform that eliminates the hassle of
              manual tournament management and replaces it with a system
              that&apos;s intuitive, automated, and built for both organizers
              and players.
            </p>

            <p>
              From registration to real-time scoring, from live bracket updates
              to seamless communication, our tools are designed to make every
              stage of the tournament smarter and smoother. Players no longer
              have to worry about complicated scheduling, unclear match
              progressions, or inconsistent scoring everything happens
              transparently, fairly, and in real time.
            </p>

            <p>
              We believe technology should enhance, not replace, the spirit of
              competition. That&apos;s why our platform focuses on fair play,
              accuracy, and inclusivity ensuring that every participant,
              regardless of skill level, enjoys the same professional standard
              of gameplay.
            </p>

            <p>
              With innovation, fairness, and a deep respect for tradition,
              we&apos;re redefining the future of competitive golf one
              tournament at a time.
            </p>

            <div className="flex justify-center lg:justify-start pt-2">
              <Link href={`/tournaments`}>
                <Button className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base">
                  Join Tournament
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* vision section */}
      <section className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-16 sm:mt-20 lg:mt-24 items-center lg:items-start">
        <div className="w-full lg:w-1/2 lg:order-2">
          <Image
            src={"/images/about/vision.png"}
            alt="Vision image"
            width={1000}
            height={1000}
            className="w-full h-auto max-w-full lg:max-w-none rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="w-full lg:w-1/2 lg:flex-1 lg:order-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-hexco text-center lg:text-left">
            <span className="text-primary">Our </span>Vision
          </h1>

          <div className="text-sm sm:text-base text-gray-500 mt-4 sm:mt-6 space-y-4 sm:space-y-5">
            <p>
              We envision a future where technology bridges every gap in the
              world of golf tournaments — bringing together players, organizers,
              and fans on one seamless digital platform. Our goal is to empower
              both players and organizers with tools that simplify management,
              enhance transparency, and make competition accessible to everyone
              — from weekend amateurs discovering their passion to seasoned
              professionals chasing championships.
            </p>

            <p>
              Through the power of cutting-edge technology and smart automation,
              we are building a global ecosystem where golf enthusiasts can
              compete with fairness, connect with others who share their love
              for the game, and celebrate every achievement together.
            </p>

            <p>
              We believe in transforming the traditional tournament experience
              into something smarter, faster, and more inclusive — where
              innovation meets sportsmanship, and every swing counts toward a
              bigger, connected future for golf.
            </p>

            <div className="flex justify-center lg:justify-start pt-2">
              <Link href={`/tournaments`}>
                <Button className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base">
                  Join Tournament
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MissionVision;
