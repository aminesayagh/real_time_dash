"use client";
import Navbar from "./Navbar";
import HomeSectionIntro from "@/app/[lng]/components/common/section/HomeSectionIntro";
import HomeSectionFaq from "@/app/[lng]/components/common/section/HomeSectionFaq";

export default function Home({
  params: { lng },
}: {
  params: {
    lng: "fr" | "en";
  };
}) {
  return (
    <>
      <Navbar lng={lng} />
      <HomeSectionIntro lang={lng} />
      <HomeSectionFaq lang={lng} />
    </>
  );
}
