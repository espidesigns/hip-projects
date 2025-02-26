/**/

document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP Plugins
  gsap.registerPlugin(ScrollTrigger);

  // Cache commonly used selectors
  const parallaxLayers = document.querySelectorAll("[parallax-layers]");
  const gsapSections = document.querySelectorAll("[stacked-photo-section]");
  const splitTypeWrappers = document.querySelectorAll("[split-type]");

  /* Hero parallax section */
  if (parallaxLayers.length) {
    const layers = [
      { layer: "1", yPercent: 70 },
      { layer: "2", yPercent: 55 },
      { layer: "3", yPercent: 40 },
      { layer: "4", yPercent: 10 },
    ];

    parallaxLayers.forEach((triggerElement) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      layers.forEach((layerObj, idx) => {
        const layerElements = triggerElement.querySelectorAll(
          `[data-parallax-layer="${layerObj.layer}"]`
        );
        if (layerElements.length) {
          tl.to(
            layerElements,
            {
              yPercent: layerObj.yPercent,
              ease: "none",
            },
            idx === 0 ? undefined : "<"
          );
        }
      });
    });
  }

  /* Lenis smooth scroll setup */
  const lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* Stacked photos */
  gsapSections.forEach((element) => {
    if (element.dataset.scriptInitialized) return;
    element.dataset.scriptInitialized = "true";

    const visualContents = element.querySelectorAll("[stacked-photo-item]");
    const visualWrap = element.querySelector("[stacked-photos]");

    if (!visualContents.length || !visualWrap) return;

    const totalHeight = Array.from(visualContents).reduce(
      (sum, content) => sum + content.offsetHeight,
      0
    );

    gsap.set(visualWrap, { height: totalHeight });

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "[stacked-photo-section]",
        start: "top top",
        end: `+=${totalHeight} ${window.innerHeight * 0.6}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    const rotations = [0, -3.5, 5, -8, 2];
    masterTimeline.add(
      gsap.timeline().fromTo(
        "[stacked-photo-item]",
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          stagger: 100,
          duration: 50,
          rotate: (index) => rotations[index],
        }
      )
    );
  });

  /* Split Text Animations */
  const mm = gsap.matchMedia();

  mm.add(
    "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    () => {
      splitTypeWrappers.forEach((wrap) => {
        const createSplitType = (selector, options) => {
          const elements = wrap.querySelectorAll(selector);
          return elements.length ? new SplitType(elements, options) : null;
        };

        const splitConfig = { types: "words, chars", tagName: "span" };
        const typeSplitHeader = createSplitType("[text-split]", splitConfig);
        const typeSplit = createSplitType("[text-split] h2", splitConfig);
        const typeSplitPara = createSplitType("[text-split] p", {
          ...splitConfig,
          types: "lines, words, chars",
        });

        // Helper function for scroll triggers
        const createScrollTrigger = (
          triggerElement,
          timeline,
          start = "top 60%"
        ) => {
          ScrollTrigger.create({
            trigger: triggerElement,
            start: "top bottom",
            onLeaveBack: () => {
              timeline.progress(0);
              timeline.pause();
            },
          });

          ScrollTrigger.create({
            trigger: triggerElement,
            start: start,
            onEnter: () => timeline.play(),
          });
        };

        // Apply animations
        ["[words-slide-from-right]", "[letters-slide-up]"].forEach(
          (selector) => {
            wrap.querySelectorAll(selector).forEach((text) => {
              const tl = gsap.timeline({ paused: true });
              const config = selector.includes("words-slide")
                ? {
                    opacity: 0,
                    x: "1em",
                    duration: 0.6,
                    ease: "power2.out",
                    stagger: { amount: 0.2 },
                  }
                : {
                    yPercent: 100,
                    duration: 0.2,
                    ease: "power1.out",
                    stagger: { amount: 0.6 },
                  };

              tl.from(text.querySelectorAll(".char"), config);
              createScrollTrigger(
                text,
                tl,
                selector.includes("words-slide") ? "top 90%" : "top 60%"
              );
            });
          }
        );

        // Scrub animation
        wrap.querySelectorAll("[scrub-each-word]").forEach((text) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: text,
                start: "top 90%",
                end: "top center",
                scrub: 1,
              },
            })
            .from(text.querySelectorAll(".char"), {
              opacity: 0.2,
              duration: 0.2,
              ease: "power1.out",
              stagger: { each: 0.4 },
            });
        });

        // Ensure content is visible
        gsap.set("[text-split]", { opacity: 1 });
      });
    }
  );

  // Ensure content is visible for mobile and reduced motion
  mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
    gsap.set("[text-split]", { opacity: 1 });
  });
});

/**/
