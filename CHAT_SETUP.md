# Chat messaging setup

Buddy's GIF picker uses the GIPHY Search API. Create a GIPHY API key in the [GIPHY Developer Dashboard](https://developers.giphy.com/dashboard/) and set it as the `GIPHY_API_KEY` environment variable for the app.

For Vercel, add `GIPHY_API_KEY` under **Project Settings → Environment Variables**, then redeploy. For local development, export the variable before starting Buddy:

```sh
GIPHY_API_KEY=your_key npm start
```

The key is provided to the browser through Buddy's same-origin configuration endpoint because GIPHY requires its Search API calls to come from the client. Treat it as a public browser key and create a dedicated key for the web app; do not commit its value to the repository. GIPHY beta keys are rate limited; the dashboard has the current limits and upgrade process.

The chat now supports the full searchable emoji catalog, GIF search and trending results, message replies, reactions, copy, and editing/deleting your own messages. GIF results use the G rating.
