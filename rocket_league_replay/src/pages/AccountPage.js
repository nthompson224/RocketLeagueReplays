import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/helper/supabaseClient";
import { FaDownload } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import NavBar from "../lib/widgets/NavBar";
import "../styles/Account.css";

const CLIPCDNURL =
  "https://spfmrljfsrgwoufuaizw.supabase.co/storage/v1/object/public/clip-files/";

function AccountPage(props) {
  const [user, setUser] = useState(null);
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");
  const [replayMedia, setReplayMedia] = useState([]);
  const [clipMedia, setClipMedia] = useState([]);
  const [showPopup, setShowPopUp] = useState(false);
  const [replayUrl, setReplayUrl] = useState("");

  async function handleReplayDownload(url, name) {
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

  async function handleClipDownload(url, name) {
    if (window.confirm("Are you sure you want to download this replay?")) {
      const { data, error } = await supabase.storage
        .from("clip-files")
        .download(url);
      if (data) {
        const blob = data;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${name}.mp4`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        console.log(error);
      }
    }
  }

  async function handleClipDelete(url) {
    if (window.confirm("Are you sure you want to download this replay?")) {
      const { data, error } = await supabase.storage
        .from("clip-files")
        .remove(url);
      if (data) {
        const { data, error } = await supabase
          .from("clips")
          .delete()
          .eq("clipUrl", url);
      } else {
        console.log(error);
      }
    }
  }

  function parseTimestamp(timestamp) {
    const dateEndIndex = timestamp.indexOf("T");
    const timeEndIndex = timestamp.indexOf(".");

    let date = timestamp.slice(0, dateEndIndex);
    let time = timestamp.slice(dateEndIndex + 1, timeEndIndex);

    const parsedTimestamp = `${date} ${time}`;

    return parsedTimestamp;
  }

  async function getReplayMedia(id) {
    const { data, error } = await supabase
      .from("replays")
      .select()
      .eq("author_uuid", id);
    if (data) {
      setReplayMedia(data);
    } else {
      console.log("error");
    }
  }

  async function getClipMedia(id) {
    const { data, error } = await supabase
      .from("clips")
      .select()
      .eq("author_uuid", id);
    if (data) {
      setClipMedia(data);
    } else {
      console.log("error");
    }
  }

  async function getUsername(authorUUID) {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_name")
      .eq("id", authorUUID);
    if (data) {
      setUsername(data[0].user_name);
    } else {
      console.log(error);
      return "N/A";
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user !== null) {
          setUser(user);
          setUserID(user.id);
          getUsername(user.id);
          getReplayMedia(user.id);
          getClipMedia(user.id);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.log(e);
      }
    };
    getUser();
  }, [user]);

  return (
    <div className="base">
      <NavBar user={userID} />
      <div className="main">
        <div className="account-header">
          <div className="account-details">
            <div className="username">Your Uploads</div>
          </div>
        </div>
        <div className="account-content">
          <ul className="clips-account-replays">
            <h2 className="replays-header">Demos</h2>
            {replayMedia.map((mediaData) => (
              <li key={mediaData.replayUrl}>
                <div className="replay-container">
                  <div className="row1">
                    <h2 className="replay-title">{mediaData.replayName}</h2>
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
                    <div className="download">
                      <button
                        id="download"
                        onClick={() =>
                          handleReplayDownload(
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
                  <div className="row2">
                    <h4>Uploaded by:</h4>
                    <h4 className="author">{mediaData.author}</h4>
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
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <ul className="clips-account-replays">
            <h2 className="clips-header">Clips</h2>
            {clipMedia.map((mediaData) => (
              <li key={mediaData.clipUrl}>
                <div className="clips-replay-container">
                  <div className="clip-video">
                    <video width={500} height={300} controls>
                      <source src={CLIPCDNURL + mediaData.clipUrl} />
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
                    <h4 className="author">{mediaData.author}</h4>
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
                        id="clip-download"
                        onClick={() =>
                          handleClipDownload(
                            mediaData.clipUrl,
                            mediaData.clipName
                          )
                        }
                      ></button>
                      <label htmlFor="clip-download">
                        <FaDownload size={25} />
                      </label>
                      <div className="delete">
                        <button
                          id="clip-delete"
                          onClick={() => handleClipDelete(mediaData.clipUrl)}
                        ></button>

                        <label htmlFor="clip-delete">
                          <MdDelete size={25} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
