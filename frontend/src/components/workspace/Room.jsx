import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { getMessage } from "../../api/message.api";
import useSocket from "../../zustand/socket.store";
import { enterRoom, leaveRoom, sendAck } from "../../socket/socketController";
import useUser from "../../zustand/user.store";

const Room = ({ room, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const socket = useSocket((state) => state.socket);
  const user = useUser((state) => state.user);
  const containerRef = useRef();
  const hasInitialScrolledRef = useRef(false);

  const fetchMessages = async (limit, before) => {
    const res = await getMessage({
      targetId: room._id,
      targetType: "room",
      limit,
      before,
    });
    return res;
  };

  const loadMoreMessages = async (limit, before) => {
    // preserve scroll position when prepending messages
    const el = containerRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;
    const prevScrollTop = el ? el.scrollTop : 0;

    const res = await fetchMessages(limit, before);
    if (!res?.data) return;

    setCursor(res.data?.nextCursor);
    setMessages((prev) => [...res.data?.messages, ...prev]);

    // Wait for the DOM to update, then adjust scrollTop so the visible content stays the same
    if (el) {
      // two rAFs to ensure layout has updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
        });
      });
    }
  };

  // to be passed as a compare function to sort the messages out
  const compareMessages = (a, b) => {
    const t1 = new Date(a.createdAt).getTime();
    const t2 = new Date(b.createdAt).getTime();

    if (t1 !== t2) return t1 - t2;
    return a._id.localeCompare(b._id); // deterministic fallback
  };

  // to control entering and exiting the socket room
  useEffect(() => {
    if (!socket || !user) return;
    (async () => {
      const res = await fetchMessages(5);
      if (!res.data) {
        return;
      }
      if (res.data?.hasNextBatch && res.data?.nextCursor) {
        setCursor(res.data.nextCursor);
      } else {
        setCursor(null);
      }
      setMessages(res.data?.messages);
      enterRoom(room._id, user);
    })();

    return () => {
      leaveRoom(room._id, user);
    };
  }, [room, user, socket]);

  // to listen to messages from socket
  useEffect(() => {
    if (!socket || !user) return;
    const handler = ({ message, retry }) => {
      console.log("[RECEIVE]", message._id);
      sendAck(user._id, message._id);
      setMessages((prev) => {
        // Dedup guard
        if (prev.some((m) => m._id === message._id)) return prev;
        const next = [...prev, message];
        // Only reconcile ordering when retry is true since a hiccup chance in this low level system is very low normally will need to change if system scales
        if (retry) {
          return next.sort(compareMessages);
        }
        return next;
      });
    };
    socket.on("chat:send-msg", handler);
    return () => {
      socket.off("chat:send-msg", handler);
    };
  }, [socket, user]);

  // to adjust scroll position
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    if (!hasInitialScrolledRef.current && messages.length > 0) {
      // if initial load of room then scroll to bottom
      el.scrollTop = el.scrollHeight;
      hasInitialScrolledRef.current = true;
    }
    const distanceFromBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight);
    const isNearBottom = distanceFromBottom < 100; // a distance of 100 px from bottom will trigger a scroll to bottom
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // to reset initialScroll when room changes
  useEffect(() => {
    hasInitialScrolledRef.current = false;
  }, [room._id]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="navbar bg-base-200 px-4">
        <div className="flex-1">
          <span className="text-md md:text-lg lg:text-xl xl:text-2xl font-semibold text-base-content/70">
            {room?.name || "Chat Room"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-y-auto p-4 space-y-2"
      >
        {cursor ? (
          loadingMsg ? (
            <span></span>
          ) : (
            <button
              onClick={async () => {
                setLoadingMsg(true);
                await loadMoreMessages(5, cursor);
                setLoadingMsg(false);
              }}
              className="btn absolute top-0 left-1/2"
            >
              load more
            </button>
          )
        ) : null}
        {messages.length === 0 ? (
          <div className="text-center text-sm opacity-60">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg._id}
              message={msg}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Input */}
      <MessageInput targetId={room._id} targetType={"room"} />
    </div>
  );
};

export default Room;
