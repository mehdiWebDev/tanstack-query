import { Link, useNavigate,useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { fetchEvent,updateEvent,queryClient } from '../../util/http.js';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation } from '@tanstack/react-query';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;

      await queryClient.cancelQueries({ queryKey: ['events', id] });

      const previousEvent = queryClient.getQueryData(['events', id]);

      queryClient.setQueryData(['events', id], newEvent);

      return { previousEvent };

    },
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', id], context.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', id]);
    }

  });


  function handleSubmit(formData) {
    mutate({ id, event: formData});
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    </Modal>
  );
}
