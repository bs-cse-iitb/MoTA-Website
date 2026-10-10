// MoTA DBIM Kit — browser bundle entry (dist/dbim.js).
// Include once, at the end of <body>. Components switch on from their data-* attributes.
import { applyPrefs, readPrefs } from './prefs';
import './header';
import './dialogs';
import './carousel';
import './tabs';
import './social';
import './pagetools';
import './visitors';
import './expiry';
import './tribot';

applyPrefs(readPrefs());
