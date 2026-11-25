import type { Metadata } from "next";
import { AppLink } from "@/components/AppLink";
import { ButtonLink } from "@/components/ButtonLink";
import { ContactForm } from "@/components/ContactForm";
import { EventListRow } from "@/components/EventListRow";
import { HeroSlider } from "@/components/HeroSlider";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Colgar Foundation — Small moments. Lasting change.",
  description:
    "Colgar is a youth-led Nigerian NGO using entertainment to raise funds for education, health, and opportunity."
};

export default function HomePage() {
  return (
    <div className={styles.home}>
      <main id="main">
        <HeroSlider />

        <section className="values-strip" aria-label="Our focus">
          <div className="container values-inner">
            <span>More opportunity</span><i aria-hidden="true">✳</i>
            <span>More dignity</span><i aria-hidden="true">✳</i>
            <span>More room to grow</span><i aria-hidden="true">✳</i>
            <span>For every young person</span>
          </div>
        </section>

        <section className="about section-pad" id="about">
          <div className="container about-grid">
            <Reveal className="section-kicker">
              <span className="eyebrow">Who we are</span>
              <span className="kicker-stamp" aria-hidden="true">Good<br />starts<br />here.</span>
            </Reveal>
            <Reveal className="about-copy">
              <h2>We believe change should bring people <em>together.</em></h2>
              <p className="about-lede">Colgar is a youth-led unity NGO using entertainment to raise funds for the issues that matter to young people in Nigeria.</p>
              <p>From poverty and unemployment to literacy and mental health, we create joyful, community-powered ways to support the next generation. We’re more than an NGO — we’re a team with new-generation ideas and a shared belief in what’s possible. We believe making a difference can be efficient and fun.</p>
              <AppLink className="text-link text-link-dark" href="/#contact">Meet us where you are <span aria-hidden="true">↗</span></AppLink>
            </Reveal>
            <Reveal className="about-image-wrap">
              <Photo
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85"
                alt="A volunteer spending time with children outdoors"
                sizes="(max-width: 620px) 100vw, (max-width: 920px) 55vw, 360px"
              />
              <div className="about-image-caption"><span>Community first</span><span>Always.</span></div>
            </Reveal>
            <Reveal className="about-stats">
              <div className="stat"><strong>6<span>+</span></strong><span>years of experience</span></div>
              <div className="stat"><strong>10</strong><span>charity projects funded</span></div>
              <div className="stat"><strong>10k<span>+</span></strong><span>people reached in Nigeria</span></div>
            </Reveal>
          </div>
        </section>

        <section className="campaigns section-pad" id="campaigns">
          <div className="container">
            <Reveal className="section-heading">
              <div><span className="eyebrow">On the ground</span><h2>Care that makes<br /><em>a difference.</em></h2></div>
              <p>From menstrual health to education, every campaign meets a real need with care, dignity, and a community behind it.</p>
            </Reveal>
            <div className="campaign-grid">
              <Reveal as="article" className="campaign-card campaign-feature">
                <div className="campaign-image">
                  <Photo
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85"
                    alt="Students learning together in a classroom"
                    sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 620px"
                  />
                  <span className="campaign-tag">Campaign · Abuja</span>
                </div>
                <div className="campaign-content">
                  <div className="campaign-title-row"><span className="campaign-status"><i /> Goal reached</span></div>
                  <h3>Colgar Ladies Care</h3>
                  <p>Supporting access to sanitary pads and menstrual health education for girls.</p>
                  <div className="progress-label"><span>Sanitary pads raised</span><strong>400 / 400</strong></div>
                  <div className="progress-track"><span style={{ width: "100%" }} /></div>
                  <div className="campaign-foot"><span>Campaign ended · 4 July 2025</span><AppLink href="/campaign-ladies-care" aria-label="Read about Colgar Ladies Care Abuja">Read the story <span aria-hidden="true">↗</span></AppLink></div>
                </div>
              </Reveal>
              <Reveal as="article" className="campaign-card campaign-secondary">
                <div className="campaign-image">
                  <Photo
                    src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=85"
                    alt="Volunteers working together at a community event"
                    sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 500px"
                  />
                  <span className="campaign-tag">Campaign · Lagos</span>
                </div>
                <div className="campaign-content">
                  <div className="campaign-title-row"><span className="campaign-status"><i /> Completed</span></div>
                  <h3>Colgar Ladies Care · Lagos</h3>
                  <p>A community campaign for menstrual care, confidence, and wellbeing.</p>
                  <div className="progress-label"><span>Fundraising target</span><strong>₦600,000</strong></div>
                  <div className="progress-track"><span style={{ width: "100%" }} /></div>
                  <div className="campaign-foot"><span>Campaign ended · 8 April 2025</span><AppLink href="/campaign-ladies-care-lagos">Program details <span aria-hidden="true">↗</span></AppLink></div>
                </div>
              </Reveal>
            </div>
            <div className="campaign-cta"><span>Every small act adds up.</span><AppLink className="text-link text-link-dark" href="/campaigns">Explore all campaigns <span aria-hidden="true">↗</span></AppLink></div>
          </div>
        </section>

        <section className="join section-pad">
          <div className="container join-grid">
            <Reveal className="join-copy">
              <span className="eyebrow eyebrow-light">There’s a place for you</span>
              <h2>Let’s make a<br /><em>difference today.</em></h2>
              <p>Be a catalyst for change. Bring your time, your voice, or your support — and help make a difference in the lives of Nigeria’s youth. Fundraise for the people and causes you care about, and help good ideas reach further.</p>
              <ButtonLink variant="paper" href="/volunteer">Get involved <span aria-hidden="true">↗</span></ButtonLink>
            </Reveal>
            <div className="join-options">
              <Reveal as="a" className="join-option" href="/volunteer">
                <span className="join-icon" aria-hidden="true">↗</span><span className="join-option-text"><small>Give your time</small><strong>Become a volunteer</strong><span>Show up for young people in your community.</span></span><span className="join-arrow" aria-hidden="true">↗</span>
              </Reveal>
              <Reveal as="a" className="join-option" href="/donate">
                <span className="join-icon" aria-hidden="true">✳</span><span className="join-option-text"><small>Give what you can</small><strong>Donate to support</strong><span>Help good work reach more people.</span></span><span className="join-arrow" aria-hidden="true">↗</span>
              </Reveal>
              <Reveal as="a" className="join-option" href="/#contact">
                <span className="join-icon" aria-hidden="true">↗</span><span className="join-option-text"><small>Grow together</small><strong>Become a sponsor</strong><span>Partner with us to foster lasting change.</span></span><span className="join-arrow" aria-hidden="true">↗</span>
              </Reveal>
            </div>
          </div>
          <span className="join-decoration" aria-hidden="true">COLGAR</span>
        </section>

        <section className="video-section section-pad" id="our-video">
          <div className="container video-section-grid">
            <Reveal className="video-section-copy">
              <span className="eyebrow">A closer look at our work</span>
              <h2>See what showing up can <em>make possible.</em></h2>
              <p>Watch how small moments of care and community support can help create lasting change.</p>
            </Reveal>
            <Reveal className="video-player">
              <div className="video-player-frame">
                <iframe
                  src="https://www.youtube.com/embed/MxcgikOGdBc?feature=oembed"
                  title="How Nigerian Youth Are Driving Sustainable Charity with Colgar Cloth Bank at Malete"
                  loading="lazy"
                  referrerPolicy="origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="video-fallback"><AppLink href="https://youtu.be/MxcgikOGdBc">Watch the video on YouTube</AppLink> <span aria-hidden="true">↗</span></p>
            </Reveal>
          </div>
        </section>

        <section className="events section-pad" id="events">
          <div className="container">
            <Reveal className="section-heading">
              <div><span className="eyebrow">Come together</span><h2>Good causes.<br /><em>Good company.</em></h2></div>
              <p>Our events make space for connection, creativity, and community-led change. Here are a few from the Colgar calendar.</p>
            </Reveal>
            <div className="event-list">
              <EventListRow
                day="15"
                month="DEC"
                category="Movie night · Ilorin, Kwara"
                title="Social Construction"
                description="A Halloween movie night for change, at Garden 66."
                primaryDetail="5:00 pm – 10:00 pm"
                secondaryDetail="Garden 66, Ilorin, Kwara"
                href="/event"
                ariaLabel="See details for Social Construction"
              />
              <EventListRow
                day="27"
                month="JUN"
                category="Community sport · Ilorin, Kwara"
                title="Colgar Original"
                description="A football fun-fare match held in Ilorin."
                primaryDetail="Event finished"
                secondaryDetail="Ilorin, Kwara"
                href="/event"
                ariaLabel="Learn more about Colgar Original"
                muted
              />
            </div>
            <p className="event-footnote">Event dates shown as listed by Colgar. Check the event page for current details.</p>
          </div>
        </section>

        <section className="team section-pad">
          <div className="container team-grid">
            <Reveal className="team-intro"><span className="eyebrow">The people behind it</span><h2>Good work takes<br /><em>a good team.</em></h2><p>A youth-led team bringing health expertise, outreach, research, and fresh ideas to the work.</p><AppLink className="text-link text-link-dark" href="/#contact">Say hello <span aria-hidden="true">↗</span></AppLink></Reveal>
            <div className="team-cards">
              <TeamMemberCard image="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=85" alt="Portrait of a woman" role="Health & wellbeing" name="Sanni Maryam" description="Public health expert · MSc student in Public Health at Nile University" />
              <TeamMemberCard image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85" alt="Portrait of a man" role="Community outreach" name="Haadi Olabayo Olanrewaju" description="Outreach coordinator · MSc in International Business Management" />
              <TeamMemberCard image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=85" alt="Portrait of a woman" role="Research & planning" name="Modupesola" description="Outreach coordinator · Research and planning for community programs" />
            </div>
          </div>
        </section>

        <section className="stories section-pad" id="stories">
          <div className="container">
            <Reveal className="section-heading">
              <div><span className="eyebrow">Notes from the field</span><h2>Stories that <em>stay with you.</em></h2></div>
              <AppLink className="text-link text-link-dark" href="/blog">All stories <span aria-hidden="true">↗</span></AppLink>
            </Reveal>
            <div className="story-grid">
              <Reveal as="a" className="story-card" href="/blog/students-pads-outreach">
                <div className="story-image"><Photo src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85" alt="Students learning together in a classroom" sizes="(max-width: 620px) 40vw, 270px" /><span>Donation · 29 June 2025</span></div>
                <div className="story-copy"><h3>800 students, 1 public school, enough pads to go round.</h3><p>We knew what we were here for. It wasn’t our first time…</p><span className="story-read">Read the story <b aria-hidden="true">↗</b></span></div>
              </Reveal>
              <Reveal as="a" className="story-card" href="/blog/offa-clothing-drive">
                <div className="story-image"><Photo src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85" alt="Community members sharing a moment" sizes="(max-width: 620px) 40vw, 270px" /><span>Cloth Bank · Outreach</span></div>
                <div className="story-copy"><h3>Charity clothing drive outreach in Offa, Kwara State</h3><p>In a world where the gap between the privileged and less fortunate…</p><span className="story-read">Read the story <b aria-hidden="true">↗</b></span></div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="contact section-pad" id="contact">
          <div className="container contact-grid">
            <Reveal className="contact-copy"><span className="eyebrow eyebrow-light">Let’s talk</span><h2>Have a little<br /><em>good to give?</em></h2><p>Tell us how you’d like to get involved. We’d love to hear from you.</p><div className="contact-details"><AppLink href="mailto:contact@colgar.org">contact@colgar.org <span aria-hidden="true">↗</span></AppLink><AppLink href="tel:+2348151154069">+234 815 115 4069</AppLink><span>Lagos, Nigeria</span></div></Reveal>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter page="home" />
    </div>
  );
}
