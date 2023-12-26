import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/helper/supabaseClient";
import { FaDownload } from "react-icons/fa";

import NavBar from "../lib/widgets/NavBar";
import "../styles/Clips.css";

const CDNURL =
  "https://spfmrljfsrgwoufuaizw.supabase.co/storage/v1/object/public/clip-files/";

function HomePage() {
  const loginRedirect = useNavigate();

  const [userID, setUserID] = useState("");
  const [media, setMedia] = useState([]);
  const [modeTags, setModeTags] = useState([]);
  const [rankTags, setRankTags] = useState([]);
  const [miscTags, setMiscTags] = useState([]);
  const [replayName, setReplayName] = useState("");
  const [replayPlayers, setReplayPlayers] = useState("");
  const [allReplays, setAllReplays] = useState(true);
  const [noFilesError, setNoFilesError] = useState("");

  async function filterUserMedia() {
    let names = splitNames(replayPlayers);

    let query = supabase.from("clips").select().eq("author_uuid", userID);

    if (replayName !== "") {
      query = query.like("replayName", `%${replayName}%`);
    }
    if (names.length > 0) {
      query = query.contains("players", names);
    }
    if (modeTags.length > 0) {
      query = query.in("mode", modeTags);
    }
    if (rankTags.length > 0) {
      query = query.in("rank", rankTags);
    }
    if (miscTags.length > 0) {
      query = query.in("misc", miscTags);
    }

    const { data, error } = await query;

    if (data) {
      if (data.length > 0) {
        setMedia(data);
        setNoFilesError("");
      } else {
        setNoFilesError("No files matched your specifications.");
      }
    } else if (error) {
      console.log(error);
    }
  }

  async function filterAllMedia() {
    let names = splitNames(replayPlayers);
    console.log(names);

    let query = supabase.from("clips").select();

    if (replayName !== "") {
      query = query.like("replayName", `%${replayName}%`);
    }
    if (names.length > 0) {
      query = query.contains("players", names);
    }
    if (modeTags.length > 0) {
      query = query.in("mode", modeTags);
    }
    if (rankTags.length > 0) {
      query = query.in("rank", rankTags);
    }
    if (miscTags.length > 0) {
      query = query.in("misc", miscTags);
    }

    const { data, error } = await query;

    if (data) {
      if (data.length > 0) {
        setMedia(data);
        setNoFilesError("");
      } else {
        setNoFilesError("No files matched your specifications.");
      }
    } else if (error) {
      console.log(error);
    }
  }

  function resetFilters() {
    setReplayName("");
    setReplayPlayers("");

    setModeTags([]);
    setRankTags([]);
    setMiscTags([]);

    document
      .querySelectorAll("input[type=checkbox]")
      .forEach((el) => (el.checked = false));

    getMedia();
  }

  async function getMedia() {
    const { data, error } = await supabase.from("clips").select();
    if (data) {
      setMedia(data);
    } else {
      console.log(error);
    }
  }

  async function handleDownload(url, name) {
    if (window.confirm("Are you sure you want to download this replay?")) {
      const { data, error } = await supabase.storage
        .from("replay-files")
        .download(url);
      if (data) {
        const blob = data;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${name}.replay`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        console.log(error);
      }
    }
  }

  function splitNames(str) {
    const re = /"(.*?)"/g;
    const result = [];
    let current;
    while ((current = re.exec(str))) {
      result.push(current.pop());
    }

    return result;
  }

  function updateModeTags(tag) {
    let tempTags = modeTags;
    const index = tempTags.indexOf(tag);
    if (index > -1) {
      tempTags.splice(index, 1);
    } else {
      tempTags.push(tag);
    }
    setModeTags(tempTags);
    console.log(modeTags);
  }

  function updateRankTags(tag) {
    let tempTags = rankTags;
    const index = tempTags.indexOf(tag);
    if (index > -1) {
      tempTags.splice(index, 1);
    } else {
      tempTags.push(tag);
    }
    setRankTags(tempTags);
  }

  function updateMiscTags(tag) {
    let tempTags = miscTags;
    const index = tempTags.indexOf(tag);
    if (index > -1) {
      tempTags.splice(index, 1);
    } else {
      tempTags.push(tag);
    }
    setMiscTags(tempTags);
  }

  function parseTimestamp(timestamp) {
    const dateEndIndex = timestamp.indexOf("T");
    const timeEndIndex = timestamp.indexOf(".");

    let date = timestamp.slice(0, dateEndIndex);
    let time = timestamp.slice(dateEndIndex + 1, timeEndIndex);

    const parsedTimestamp = `${date} ${time}`;

    return parsedTimestamp;
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user !== null) {
          setUserID(user.id);
          getMedia();
        } else {
          setUserID("");
          loginRedirect("/login", { state: { userID: userID } });
        }
      } catch (e) {}
    };
    getUser();
  }, [userID, loginRedirect]);

  return (
    <div className="base">
      <NavBar user={userID} />
      <div className="home">
        <div className="search">
          <div className="field">
            <label>
              <input
                type="radio"
                name="uploader"
                onClick={() => setAllReplays(false)}
              />
              My Clips
            </label>
            <label>
              <input
                type="radio"
                name="uploader"
                onClick={() => setAllReplays(true)}
                defaultChecked
              />
              All Clips
            </label>
          </div>
          <div className="text-search-labels">
            <div className="input">
              <input
                type="text"
                id="replay-name"
                value={replayName}
                onChange={(e) => setReplayName(e.target.value)}
                placeholder=""
              />
              <div className="label">
                <label htmlFor="replay-name">Replay Name</label>
              </div>
            </div>
            <div className="input">
              <input
                type="text"
                id="players"
                value={replayPlayers}
                onChange={(e) => setReplayPlayers(e.target.value)}
                placeholder=""
              />
              <div className="label">
                <label htmlFor="players">
                  Players (put between quotes , e.g. "Squishy")
                </label>
              </div>
            </div>
          </div>
          <div className="tag-content">
            <div className="tag">
              <div>
                <h3>Mode</h3>
                <div className="tags-grid">
                  <div className="tags-grid-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        onChange={() => updateModeTags("Ranked Duel")}
                      />
                      Ranked Duel
                    </label>
                  </div>
                  <div className="tags-grid-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        onChange={() => updateModeTags("Ranked Doubles")}
                      />
                      Ranked Doubles
                    </label>
                  </div>
                  <div className="tags-grid-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        onChange={() => updateModeTags("Ranked Standard")}
                      />
                      Ranked Standard
                    </label>
                  </div>
                  <div className="tags-grid-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        onChange={() => updateModeTags("Unranked Duel")}
                      />
                      Unranked Duel
                    </label>
                  </div>
                  <div className="tags-grid-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        onChange={() => updateModeTags("Unranked Doubles")}
                      />
                      Unranked Doubles
                    </label>
                  </div>
                  <div className="tags-grid-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        onChange={() => updateModeTags("Unranked Standard")}
                      />
                      Unranked Standard
                    </label>
                  </div>
                </div>
              </div>
              <div className="tags rank">
                <h3>Rank</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateRankTags("Bronze")}
                  />
                  Bronze
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateRankTags("Silver")}
                  />
                  Silver
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateRankTags("Gold")}
                  />
                  Gold
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateRankTags("Platinum")}
                  />
                  Platinum
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateRankTags("Diamond")}
                  />
                  Diamond
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateRankTags("Champion")}
                  />
                  Champion
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateRankTags("Grand Champion")}
                  />
                  Grand
                  <br />
                  Champion
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateRankTags("SSL")}
                  />
                  SSL
                </label>
              </div>
              <div className="tags misc">
                <h3>Misc</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateMiscTags("Tournament")}
                  />
                  Tournament
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateMiscTags("Scrimmage")}
                  />
                  Scrimmage
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateMiscTags("Private")}
                  />
                  Private
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateMiscTags("Season")}
                  />
                  Season
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateMiscTags("Offline")}
                  />
                  Offline
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={() => updateMiscTags("Local Lobby")}
                  />
                  Local Lobby
                </label>
              </div>
            </div>
            <div className="button-row">
              <button onClick={allReplays ? filterAllMedia : filterUserMedia}>
                Filter
              </button>
              <button onClick={resetFilters}>Reset</button>
            </div>
            <div className="error">
              {noFilesError === "" ? <></> : <p>{noFilesError}</p>}
            </div>
          </div>
        </div>
        <ul className="clips-replays">
          {media.map((mediaData) => (
            <li key={mediaData.clipUrl}>
              <div className="clips-replay-container">
                <div className="clip-video">
                  <video width={500} height={300} controls>
                    <source src={CDNURL + mediaData.clipUrl} />
                  </video>
                </div>
                <div className="row1">
                  <h2 className="replay-title">{mediaData.clipName}</h2>
                  <div className="replay-tags">
                    {mediaData.mode === null ? (
                      <></>
                    ) : (
                      <span className="replay-tag">{mediaData.mode}</span>
                    )}

                    {mediaData.rank === null ? (
                      <></>
                    ) : (
                      <span className="replay-tag">{mediaData.rank}</span>
                    )}
                    {mediaData.misc === null ? (
                      <></>
                    ) : (
                      <span className="replay-tag">{mediaData.misc}</span>
                    )}
                  </div>
                </div>
                <div className="row2">
                  <h4>Uploaded by:</h4>
                  <div className="author">
                    <Link
                      to={{
                        pathname: `/account/${mediaData.author}`,
                      }}
                      state={{ username: mediaData.author }}
                    >
                      <h4>{mediaData.author}</h4>
                    </Link>
                  </div>
                  <h5 className="timestamp">
                    ({parseTimestamp(mediaData.created_at)})
                  </h5>
                </div>
                <div className="row3">
                  <h4>Players: </h4>
                  {mediaData.players.length === 0 ? (
                    <h4 className="no-players">None specified</h4>
                  ) : (
                    mediaData.players.map((player) => (
                      <h4 key={player} className="player">
                        {player}
                      </h4>
                    ))
                  )}
                  <div className="download">
                    <button
                      id="download"
                      onClick={() =>
                        handleDownload(
                          mediaData.replayUrl,
                          mediaData.replayName
                        )
                      }
                    ></button>
                    <label htmlFor="download">
                      <FaDownload size={25} />
                    </label>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
