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
(`NOTIFY_EMAIL`), currently `shaygrizz@gmail.com`. The email is submitted when
she presses **Confirm date** after choosing a day and time. It includes the film,
date, time, time zone and number of attempts to press No. One-time activation:

1. Put the site online (or run it locally) and go through it once yourself,
   all the way to the last page.
2. FormSubmit emails you an activation message. Open it and click the
   activation button. Check your spam folder if you do not see it.
3. Go through the site again. From now on every finished date sends you an email
   with the day, time, and how many times she tried to press No.

Tip: the activation email also gives you a random alias for your form. You can
paste that alias into `NOTIFY_EMAIL` instead of your address, so your real email
is not visible in the public page source.

The final page has no copy-message prompt or Copy button. If an email request
fails, she can press **Try sending again** without repeating the invitation.
The page reports submission to the email service; inbox delivery depends on
activation and the email provider. Test the flow and activate it before sharing
the website. The movie night itself remains on Discord.

The trailer plays inside the page. The embed sends the site's origin and referrer,
and falling decorations stay clear of the player during playback. Availability
still depends on YouTube and the video's embedding settings.

The round pictures are fully opaque and fall in the background on either side
of the invitation. They never cover the card, text, buttons or trailer. On narrow
screens without room beside the card, the pictures are hidden.

## Customise

- Film and trailer: `FILM_TITLE` and `TRAILER_ID` in `js/config.js`.
- Wording: the headline and lines are in `index.html`; the teasing lines
  for the No button are in the `lines` array in `js/main.js`.
- Colours and fonts: the variables at the top of `css/style.css`.
