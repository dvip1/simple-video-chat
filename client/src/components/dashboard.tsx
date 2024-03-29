import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/socketProvider";

type FormValues = {
  roomId: string;
  userId: string;
};

export default function DashBoard() {
  const { register, handleSubmit } = useForm<FormValues>();
  const navigate = useNavigate();
  const socket = useSocket();
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const userID = data.userId;
    const roomID = data.roomId;
    socket?.emit("room:join", { userID, room: roomID });
    navigate(`/room/${roomID}`, { state: { userID, roomID } });
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4 m-2"
      >
        <label htmlFor="roomId" className="text-lg ">
          Room Name:
        </label>
        <input
          id="roomId"
          type="text"
          {...register("roomId")}
          required
          className="border-2 border-[#C6EBC5] focus:outline-[#A1C398] p-2  max-w-sm rounded-xl"
        />

        <label htmlFor="userId" className="text-lg ">
          username:
        </label>
        <input
          id="userId"
          type="text"
          {...register("userId")}
          required
          className="border-2 border-[#C6EBC5] focus:outline-[#A1C398] p-2  max-w-sm rounded-xl"
        />

        <button
          type="submit"
          className="bg-[#FA7070] text-white font-bold py-2 px-4  w-24 rounded-xl"
        >
          Submit
        </button>
      </form>
    </>
  );
}
