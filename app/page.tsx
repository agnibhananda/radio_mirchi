import GlitchLogo from './components/GlitchLogo';
import PixelButton from './components/PixelButton';
import CRTBackground from './components/CRTBackground';
import AboutSection from './components/AboutSection';

export default function Home() {
  return (
    <CRTBackground>
      <main className="flex flex-col items-center justify-center w-full min-h-screen px-4">
        <GlitchLogo />
        <p className="text-[#baffc9] text-center text-base md:text-lg mb-8 max-w-xl" style={{fontFamily: 'inherit'}}>
          Infiltrate the narrative. Tune in. Speak up. Disrupt the signal.
        </p>
        <PixelButton className="mb-12 text-xl px-10 py-4">{'>'} boot.exe</PixelButton>
        <AboutSection />
      </main>
    </CRTBackground>
  );
}
