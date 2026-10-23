-- Removes only this API. Captures, events and attachments are preserved.
drop function if exists public.nocturne_review_capture(uuid,timestamptz);
