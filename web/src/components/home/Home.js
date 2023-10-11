import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "./Home.css";

const baseUrl = "http://localhost:4001";

export default function Home() {
  const postTitleInputRef = useRef(null);
  const postTextInputRef = useRef(null);
  const searchInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editAlert, setEditAlert] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [toggleRefresh, setToggleRefresh] = useState(false);

  const getAllPost = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/api/v1/posts`);
      console.log(response.data);

      setIsLoading(false);
      setAllPosts([...response.data]);
    } catch (error) {
      // handle error
      console.log(error.data);
      setIsLoading(false);
    }
  };

  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/api/v1/search?q=${searchInputRef.current.value}`
      );
      console.log(response.data);

      setIsLoading(false);
      setAllPosts([...response.data]);
    } catch (error) {
      // handle error
      console.log(error.data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllPost();

    // return ()=>{
    //     // cleanup function
    // }
  }, [toggleRefresh]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const response = await axios.post(`${baseUrl}/api/v1/post`, {
        title: postTitleInputRef.current.value,
        text: postTextInputRef.current.value,
      });

      setIsLoading(false);
      console.log(response.data);
      //   getAllPost();
      setAlert(response.data.message);
      setToggleRefresh(!toggleRefresh);
      e.target.reset();
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  const deletePostHandler = async (_id) => {
    try {
      setIsLoading(true);

      const response = await axios.delete(`${baseUrl}/api/v1/post/${_id}`, {
        title: postTitleInputRef.current.value,
        text: postTextInputRef.current.value,
      });

      setIsLoading(false);
      console.log(response.data);
      setAlert(response.data.message);
      setToggleRefresh(!toggleRefresh);
      // getAllPost();
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  const editSaveSubmitHandler = async (e) => {
    e.preventDefault();
    const _id = e.target.elements[0].value;
    const title = e.target.elements[1].value;
    const text = e.target.elements[2].value;

    try {
      setIsLoading(true);

      const response = await axios.put(`${baseUrl}/api/v1/post/${_id}`, {
        title: title,
        text: text,
      });

      setIsLoading(false);
      console.log(response.data);
      setAlert(response?.data?.message);
      setToggleRefresh(!toggleRefresh);
      // getAllPost();
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <form onSubmit={searchHandler} className="input-bar">
          <div>
            <input
              type="search"
              className="search-input"
              placeholder="Search..."
              ref={searchInputRef}
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="main">
        <form id="formReset" onSubmit={submitHandler} className="form-card">
          <div className="form_value">
            <label htmlFor="postTitleInput"> Post Title: </label>
            <br />
            <input
              id="postTitleInput"
              type="text"
              minLength={2}
              maxLength={20}
              ref={postTitleInputRef}
              required
              className="postTitle"
            />
            <br />
            <br />

            <label htmlFor="postBodyInput"> Post Text: </label>
            <br />
            <textarea
              id="postBodyInput"
              type="text"
              minLength={2}
              maxLength={999}
              ref={postTextInputRef}
              required
              className="postText"
            ></textarea>
            <br />
            <br />
            <button type="submit" className="post-btn">
              Publish Post
            </button>
            <span>
              {alert && alert}
              {isLoading && "Loading...."}
            </span>
          </div>
        </form>
      </div>

      <div className="all-post">
        {allPosts.map((post, index) => (
          <div className="post" key={post._id}>
            {post.isEdit ? (
              <form onSubmit={editSaveSubmitHandler}>
                <input value={post._id} type="text" disabled hidden />
                <br />
                <input
                  defaultValue={post.title}
                  type="text"
                  placeholder="title"
                />
                <br />
                <textarea
                  defaultValue={post.text}
                  type="text"
                  placeholder="body"
                />
                <br />
                <button type="submit">Save</button>
                <button
                  type="button"
                  onClick={() => {
                    post.isEdit = false;
                    setAllPosts([...allPosts]);
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              // edit post form
              <div>
                <h2>{post.title}</h2>
                <p>{post.text}</p>
                <br />
                <button
                  onClick={(e) => {
                    allPosts[index].isEdit = true;
                    setAllPosts([...allPosts]);
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    deletePostHandler(post._id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
