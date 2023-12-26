import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { IconContext } from "react-icons";
import { FiUpload } from "react-icons/fi";
import { Ring } from "@uiball/loaders";

import { supabase } from "../lib/helper/supabaseClient";
import NavBar from "../lib/widgets/NavBar";

import "../styles/Upload.css";

function UploadPage() {
  const loginRedirect = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");
  const [modeAttr, setModeAttr] = useState(null);
  const [rankAttr, setRankAttr] = useState(null);
  const [miscAttr, setMiscAttr] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [replayName, setReplayName] = useState("");
  const [replayPlayers, setReplayPlayers] = useState("");

  function handleFileChange(event) {
    if (event.target.files[0] && replayName === "") {
      setReplayName(event.target.files[0].name.split(".")[0]);
    }
    setUploadFile(event.target.files[0]);
  }

  async function uploadReplayToStorage() {
    if (uploadFile === null) {
      alert("Please select a file to upload.");
      return;
    }
    if (
      getExtension(uploadFile.name) !== "replay" &&
      getExtension(uploadFile.name) !== "mp4"
    ) {
      alert("Please upload a valid .replay or .mp4 file.");
      return;
    }
    if (replayName === null) {
      setReplayName(uploadFile.name.split(".")[0]);
    }

    setIsUploading(true);

    if (getExtension(uploadFile.name) === "mp4") {
      const { data, error } = await supabase.storage
        .from("clip-files")
        .upload(`${userID}/${replayName}`, uploadFile);
      if (data) {
        console.log(data);
        uploadClipAttributesToTable();
      } else {
        setIsUploading(false);
        alert(error.message);
      }
    } else {
      const { data, error } = await supabase.storage
        .from("replay-files")
        .upload(`${userID}/${replayName}`, uploadFile);
      if (data) {
        console.log(data);
        uploadReplayAttributesToTable();
      } else {
        setIsUploading(false);
        alert(error.message);
      }
    }
  }

  async function uploadClipAttributesToTable() {
    splitPlayerNames(replayPlayers);
    const { error } = await supabase.from("clips").insert({
      clipName: replayName,
      author_uuid: userID,
      author: username,
      clipUrl: `${userID}/${replayName}`,
      players: splitPlayerNames(replayPlayers),
      mode: modeAttr,
      rank: rankAttr,
      misc: miscAttr,
    });
    if (error) {
      alert(error.message);
      const { data } = await supabase.storage
        .from("replay")
        .remove(`${userID}/${replayName}`);
    } else {
      alert("File uploaded!");
      setModeAttr(null);
      setRankAttr(null);
      setMiscAttr(null);
      setUploadFile(null);
      setReplayName("");
      setReplayPlayers("");
      setIsUploading(false);
    }
  }

  async function uploadReplayAttributesToTable() {
    splitPlayerNames(replayPlayers);
    const { error } = await supabase.from("replays").insert({
      replayName: replayName,
      author_uuid: userID,
      author: username,
      replayUrl: `${userID}/${replayName}`,
      players: splitPlayerNames(replayPlayers),
      mode: modeAttr,
      rank: rankAttr,
      misc: miscAttr,
    });
    if (error) {
      alert(error.message);
      const { data } = await supabase.storage
        .from("replay")
        .remove(`${userID}/${replayName}`);
    } else {
      alert("File uploaded!");
      setModeAttr(null);
      setRankAttr(null);
      setMiscAttr(null);
      setUploadFile(null);
      setReplayName("");
      setReplayPlayers("");
      setIsUploading(false);
    }
  }

  function splitPlayerNames(playerNames) {
    const regexp = /[^\s"]+|"([^"]*)"/gi;
    let playerNamesArr = [];

    do {
      //Each call to exec returns the next regex match as an array
      var match = regexp.exec(playerNames);
      if (match != null) {
        //Index 1 in the array is the captured group if it exists
        //Index 0 is the matched text, which we use if no captured group exists
        playerNamesArr.push(match[1] ? match[1] : match[0]);
      }
    } while (match != null);

    return playerNamesArr;
  }

  function getExtension(filename) {
    return filename.split(".").pop();
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
          setUserID(user.id);
          getUsername(user.id);
        } else {
          setUserID("");
          loginRedirect("/login", { state: { userID: userID } });
        }
      } catch (e) {}
    };
    getUser();
  }, [userID, loginRedirect]);

  return (
    <IconContext.Provider value={{ size: "1em" }}>
      <div className="upload-base">
        <NavBar user={userID} />
        <div className="container">
          <div className="upload-content">
            <div className="input-wrap">
              <label htmlFor="file-upload" className="upload-button">
                <FiUpload />
                <p>Upload</p>
              </label>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".replay, .mp4"
              />
              <div className="input">
                <input
                  type="text"
                  id="replay-name"
                  value={replayName}
                  onChange={(e) => setReplayName(e.target.value)}
                  placeholder={replayName}
                />
                <div className="label">
                  <label htmlFor="replay-name">Custom Replay Name</label>
                </div>
              </div>
              <div className="input">
                <input
                  type="text"
                  id="players"
                  value={replayPlayers}
                  onChange={(e) => setReplayPlayers(e.target.value)}
                  placeholder={replayPlayers}
                />
                <div className="label">
                  <label htmlFor="players">
                    Players (put between quotes , e.g. "Squishy")
                  </label>
                </div>
              </div>
            </div>
            <div className="tag-content">
              <h2>Tags</h2>
              <div className="tag">
                <div>
                  <h3>Mode</h3>
                  <div className="tags-grid">
                    <div className="tags-grid-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={modeAttr === "Ranked Duel"}
                          onChange={() =>
                            modeAttr === "Ranked Duel"
                              ? setModeAttr("")
                              : setModeAttr("Ranked Duel")
                          }
                        />
                        Ranked Duel
                      </label>
                    </div>
                    <div className="tags-grid-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={modeAttr === "Ranked Doubles"}
                          onChange={() =>
                            modeAttr === "Ranked Doubles"
                              ? setModeAttr("")
                              : setModeAttr("Ranked Doubles")
                          }
                        />
                        Ranked Doubles
                      </label>
                    </div>
                    <div className="tags-grid-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={modeAttr === "Ranked Standard"}
                          onChange={() =>
                            modeAttr === "Ranked Standard"
                              ? setModeAttr("")
                              : setModeAttr("Ranked Standard")
                          }
                        />
                        Ranked Standard
                      </label>
                    </div>
                    <div className="tags-grid-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={modeAttr === "Unranked Duel"}
                          onChange={() =>
                            modeAttr === "Unranked Duel"
                              ? setModeAttr("")
                              : setModeAttr("Unranked Duel")
                          }
                        />
                        Unranked Duel
                      </label>
                    </div>
                    <div className="tags-grid-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={modeAttr === "Unranked Doubles"}
                          onChange={() =>
                            modeAttr === "Unranked Doubles"
                              ? setModeAttr("")
                              : setModeAttr("Unranked Doubles")
                          }
                        />
                        Unranked Doubles
                      </label>
                    </div>
                    <div className="tags-grid-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={modeAttr === "Unranked Standard"}
                          onChange={() =>
                            modeAttr === "Unranked Standard"
                              ? setModeAttr("")
                              : setModeAttr("Unranked Standard")
                          }
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
                      checked={rankAttr === "Bronze"}
                      onChange={() =>
                        rankAttr === "Bronze"
                          ? setRankAttr("")
                          : setRankAttr("Bronze")
                      }
                    />
                    Bronze
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rankAttr === "Silver"}
                      onChange={() =>
                        rankAttr === "Silver"
                          ? setRankAttr("")
                          : setRankAttr("Silver")
                      }
                    />
                    Silver
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rankAttr === "Gold"}
                      onChange={() =>
                        rankAttr === "Gold"
                          ? setRankAttr("")
                          : setRankAttr("Gold")
                      }
                    />
                    Gold
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rankAttr === "Platinum"}
                      onChange={() =>
                        rankAttr === "Platinum"
                          ? setRankAttr("")
                          : setRankAttr("Platinum")
                      }
                    />
                    Platinum
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rankAttr === "Diamond"}
                      onChange={() =>
                        rankAttr === "Diamond"
                          ? setRankAttr("")
                          : setRankAttr("Diamond")
                      }
                    />
                    Diamond
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rankAttr === "Champion"}
                      onChange={() =>
                        rankAttr === "Champion"
                          ? setRankAttr("")
                          : setRankAttr("Champion")
                      }
                    />
                    Champion
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rankAttr === "Grand Champion"}
                      onChange={() =>
                        rankAttr === "Grand Champion"
                          ? setRankAttr("")
                          : setRankAttr("Grand Champion")
                      }
                    />
                    Grand
                    <br />
                    Champion
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rankAttr === "SSL"}
                      onChange={() =>
                        rankAttr === "SSL"
                          ? setRankAttr("")
                          : setRankAttr("SSL")
                      }
                    />
                    SSL
                  </label>
                </div>
                <div className="tags misc">
                  <h3>Misc</h3>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={miscAttr === "Tournament"}
                      onChange={() =>
                        miscAttr === "Tournament"
                          ? setMiscAttr("")
                          : setMiscAttr("Tournament")
                      }
                    />
                    Tournament
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={miscAttr === "Scrimmage"}
                      onChange={() =>
                        miscAttr === "Scrimmage"
                          ? setMiscAttr("")
                          : setMiscAttr("Scrimmage")
                      }
                    />
                    Scrimmage
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={miscAttr === "Private"}
                      onChange={() =>
                        miscAttr === "Private"
                          ? setMiscAttr("")
                          : setMiscAttr("Private")
                      }
                    />
                    Private
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={miscAttr === "Season"}
                      onChange={() =>
                        miscAttr === "Season"
                          ? setMiscAttr("")
                          : setMiscAttr("Season")
                      }
                    />
                    Season
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={miscAttr === "Offline"}
                      onChange={() =>
                        miscAttr === "Offline"
                          ? setMiscAttr("")
                          : setMiscAttr("Offline")
                      }
                    />
                    Offline
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={miscAttr === "Local Lobby"}
                      onChange={() =>
                        miscAttr === "Local Lobby"
                          ? setMiscAttr("")
                          : setMiscAttr("Local Lobby")
                      }
                    />
                    Local Lobby
                  </label>
                </div>
              </div>
            </div>
          </div>
          {isUploading ? (
            <Ring color="white" />
          ) : (
            <button className="submit-button" onClick={uploadReplayToStorage}>
              Submit
            </button>
          )}
        </div>
      </div>
    </IconContext.Provider>
  );
}

export default UploadPage;
