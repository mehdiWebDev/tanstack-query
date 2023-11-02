import { Link, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, deleteEvent } from "../../util/http.js";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../util/http.js";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";
import Header from "../Header.jsx";

import { useParams } from "react-router-dom";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 1000,
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });

      navigate("/events");
    },
  });

  const handleDelete = (e, id) => {
    setIsDeleting(true);
    mutate({ id });
  };

  const handleStartDelete = () => {
    setIsDeleting(true);
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
  };

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCancelDelete}>
          <h2>Are you sure?</h2>
          <p>Do you want to delete this event?</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting ...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleCancelDelete} className="button">
                  Cancel
                </button>
                <button
                  onClick={(e) => handleDelete(e, data.id)}
                  className="button"
                >
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title="failed to delete event"
              message={deleteError.info?.message || "failed please try again"}
            />
          )}
        </Modal>
      )}

      {isLoading && (
        <div id="event-details-content" className="center">
          <p> Loading ... </p>
        </div>
      )}
      {data && (
        <>
          <Outlet />
          <Header>
            <Link to="/events" className="nav-item">
              View all Events
            </Link>
          </Header>
          <article id="event-details">
            <header>
              <h1>{data.title}</h1>
              <nav>
                <button onClick={handleStartDelete}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={`http://localhost:3000/${data.image}`}
                alt={data.title}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>
                    {data.date} @ {data.time}
                  </time>
                </div>
                <p id="event-details-description">{data.description}</p>
              </div>
            </div>
          </article>
        </>
      )}

      {isError && (
        <div id="event-details-content" className="center">
          <p> Loading ... </p>
        </div>
      )}
    </>
  );
}
