import Image from "next/image";
import Link from "next/link";
import React from "react";

const HowItWorks = () => {
  const items = [
    {
      image: "/images/landing-page/how-it-works-1.png",
      title: "1. Register",
      desc: "Create your account and complete your player profile with handicap and club information.",
    },
    {
      image: "/images/landing-page/how-it-works-2.png",
      title: "2. Compete",
      desc: "Join tournaments, play your matches, and submit results for approval by both players.",
    },
    {
      image: "/images/landing-page/how-it-works-3.png",
      title: "3. Advance",
      desc: "Win matches to progress through the bracket and compete for the championship title.",
    },
  ];

  return (
    <div className="text-center">
      <h1 className="text-3xl font-hexco">
        <span className="text-primary">How It </span>Works
      </h1>
      <p className="text-gray-600 text-md mt-2">
        Get started in three simple steps and join the competitive golf
        community
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
        {items.map((item, index) => (
          index === 0 ? (
            <Link
              key={index}
              href="/sign-up"
              className="block p-8 shadow-[0px_8px_10px_6px_#0000001A] rounded-lg hover:scale-105 duration-200 transition-all cursor-pointer"
            >
              <Image
                src={item.image}
                alt="img.png"
                width={1000}
                height={1000}
                className="h-16 w-16 rounded-full mx-auto"
              />
              <h3 className="font-semibold my-3 text-lg">{item.title}</h3>
              <p className="text-gray-600 text-md">{item.desc}</p>
            </Link>
          ) : (
            <div
              key={index}
              className="p-8 shadow-[0px_8px_10px_6px_#0000001A] rounded-lg hover:scale-105 duration-200 transition-all"
            >
              <Image
                src={item.image}
                alt="img.png"
                width={1000}
                height={1000}
                className="h-16 w-16 rounded-full mx-auto"
              />
              <h3 className="font-semibold my-3 text-lg">{item.title}</h3>
              <p className="text-gray-600 text-md">{item.desc}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
