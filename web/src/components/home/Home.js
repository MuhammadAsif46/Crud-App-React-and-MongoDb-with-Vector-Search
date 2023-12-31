import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "./Home.css";
import swal from "sweetalert2";

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
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  //   One Click Two function call

  const deleteMainFunction = (_id) => {
    deletePost(_id);
  };

  // Sweet Alert Functions:

  const publishPost = () => {
    swal.fire("Success!", "Your Post have been Publish Thank you!", "success");
  };

  const deletePost = (_id) => {
    swal.fire({
      title: "Enter Password",
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      cancelButtonColor: "#3a3659",
      confirmButtonText: "Delete",
      confirmButtonColor: "#3a3659",
      showLoaderOnConfirm: true,
      preConfirm: (password) => {
        if (password === "1122") {
          deletePostHandler(_id);
          swal.fire({
            icon: "success",
            title: "Post Deleted",
            showConfirmButton: true,
          });
        } else {
          return swal.fire({
            icon: "error",
            title: "Invalid Password",
            text: "Please enter correct password",
            showConfirmButton: true,
          });
        }
      },
    });
  };

  const UpdateAlert = () => {
    swal.fire("Success!", "Your Post have been Updated Thank you!", "success");
  };

  const cancelPost = (post) => {
    // console.log("check cancel post");
    swal
      .fire({
        icon: "warning",
        title: "Warning...",
        text: "Are You Sure!",
      })
      .then((result) => {
        if (result.isConfirmed) {
          post.isEdit = false;
          setAllPosts([...allPosts]);
          swal.fire("success!", "Your file has been saved.", "success");
        }
      });
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
            <div className="create-post">Create New Post</div>
            <label htmlFor="postTitleInput"> Post Title: </label>
            <br />
            <input
              id="postTitleInput"
              type="text"
              minLength={2}
              maxLength={20}
              ref={postTitleInputRef}
              required
              className="postTitle "
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
            <button type="submit" className="post-btn" onClick={publishPost}>
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
              <form onSubmit={editSaveSubmitHandler} className="new">
                <input value={post._id} type="text" disabled hidden />
                <br />
                <div className="edit-post">Edit post</div>
                <input
                  defaultValue={post.title}
                  type="text"
                  placeholder="title"
                  className="postEditTitle"
                />
                <br />
                <textarea
                  defaultValue={post.text}
                  type="text"
                  placeholder="body"
                  className="postEditText"
                />
                <br />
                <button
                  type="submit"
                  className="update-btn"
                  onClick={UpdateAlert}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    cancelPost(post);
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div>
                <h2>{post.title}</h2>
                <p>{post.text}</p>
                <br />
                <button
                  className="edit-btn"
                  onClick={(e) => {
                    allPosts[index].isEdit = true;
                    setAllPosts([...allPosts]);
                  }}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    deleteMainFunction(post._id);
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
