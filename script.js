var tl = gsap.timeline()
tl.from(".image,.logo-name,.nav-options,.login", {
    y: -100,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1

})
tl.from(".box", {
    x: 100,
    opacity: 0,
    // duration: 0.5
})
tl.from(".page h1", {
    x: -300,
    opacity: 0,
    // duration: 0.3
})
tl.from(".para", {
    x:150,
    opacity: 0
})
tl.from(".budget", {
    y: 100,
    opacity: 0,
    // duration: 0.5
})
tl.from(".card-1", {
    y: 100,
    opacity: 0,
    stagger: 0.3
})
tl.from(".page-2 h1",{
    x: 100,
    opacity: 0
})
tl.from(".card-2", {
    y: 100,
    opacity: 0,
    stagger: 0.3
})