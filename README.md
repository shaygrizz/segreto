# Will you go on a date with me?

A small, romantic website that asks one question. She scratches a pastel card
to reveal it, watches the trailer, and answers. The No button runs away while
Yes keeps growing. Then she picks a day and time on a calendar, a burst of emoji
confetti follows, and you get an email with her choice.

Plain HTML, CSS and JavaScript. No build step.

## Structure

```
.
├── index.html          the page
├── css/style.css       the design
├── js/
│   ├── config.js       film, trailer and email settings (edit this)
│   └── main.js         scratch card, runaway No, calendar, confetti, email
├── assets/
│   └── prince-diamond.png   the little picture that falls on the main page
└── .nojekyll
```

## Run it locally

Open it through a small web server, because YouTube embeds do not play from a
`file://` page:

On Windows, double-click `Start Website.bat` (Python must be installed).
It opens the site in your browser and serves it locally; keep its window open.
On any platform you can also run `python start_website.py`, or:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Put it online with GitHub Pages

1. Create a new repository on GitHub and push these files to the `main` branch.
2. Open Settings, then Pages.
3. Under "Build and deployment", choose "Deploy from a branch", select `main`
   and `/ (root)`, then Save.
4. After a minute your site is at `https://YOUR-NAME.github.io/REPOSITORY/`.

## Get an email when she picks a time

The site sends the email through [FormSubmit](https://formsubmit.co), a free
service that needs no account. The address is set in `js/config.js`
(`NOTIFY_EMAIL`), currently `petrobras280@gmail.com`. The email is submitted when
she presses **Confirm date** after choosing a day and time. It includes the film,
date, time, time zone and number of attempts to press No. One-time activation:

1. Open [Email setup](https://shaygrizz.github.io/segreto/email-setup.html) and
   press **Activate / test email**. This sends a clearly labelled test, rather
   than a pretend date confirmation. The FormSubmit result opens in a new tab.
2. Open the activation email at `petrobras280@gmail.com`, check Spam if needed,
   and click **Activate Form**. Only the inbox owner does this.
3. Press the setup button again to test delivery. Anyone completing the
   invitation can then send their chosen date. No visitor account is needed.

Setup, AJAX sends and direct sends use the same `FORM_URL` in `js/config.js`.
Keep that URL stable after activation; a different site or recipient may need
another activation. When moving the website, update this value.

Tip: the activation email also gives you a random alias for your form. You can
paste that alias into `NOTIFY_EMAIL` instead of your address, so your real email
is not visible in the public page source.

The final page has no copy-message prompt or Copy button. **Send details again**
can send another email after success; **Choose another date** returns to the
calendar and permits a fresh confirmation. Only simultaneous requests are
blocked, to avoid accidental double-clicks. There is no per-person or lifetime
submission limit in the site.

Requests use FormData without a JSON preflight and include the full form URL.
Failures show the service's message; activation responses explain what to do.
If AJAX fails, **Send through FormSubmit** submits the same details directly in
another tab. The setup page uses a regular POST form for activation too.

FormSubmit advertises unlimited submissions, but its anti-spam controls and
email-provider filtering can affect delivery, especially with reCAPTCHA off.
The page confirms submission to the service, not arrival in the inbox. Activate
and test it before sharing the invitation. The movie night remains on Discord.

The trailer plays inside the page. The embed sends the site's origin and referrer,
and falling decorations stay clear of the player during playback. Availability
still depends on YouTube and the video's embedding settings.

The round pictures are fully opaque and fall in the background on either side
of the invitation. On phones they are smaller and use the empty strips beside
the content, including the card's side padding. The canvas clips those strips
and leaves an eight-pixel gap from the content, so pictures cannot cross over
the text, buttons or trailer. Larger screens keep them outside the card.
The trailer keeps the same centered 16:9 frame before and during playback.

## Customise

- Film and trailer: `FILM_TITLE` and `TRAILER_ID` in `js/config.js`.
- Wording: the headline and lines are in `index.html`; the teasing lines
  for the No button are in the `lines` array in `js/main.js`.
- Colours and fonts: the variables at the top of `css/style.css`.
