import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { Song } from '@/types';

//* Gera um link temporário (válido por 4 horas) para tocar a música.
//* O bucket "songs" é privado, então não existe mais link público.
const SIGNED_URL_SECONDS = 60 * 60 * 4;

export const useLoadSongUrl = (song: Song) => {
  const supabaseClient = useSupabaseClient();
  const [url, setUrl] = useState('');
  const songPath = song?.song_path;

  useEffect(() => {
    let cancelled = false;
    setUrl('');

    if (!songPath) {
      return;
    }

    supabaseClient.storage
      .from('songs')
      .createSignedUrl(songPath, SIGNED_URL_SECONDS)
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }
        if (error || !data) {
          console.error('Erro ao gerar o link da música:', error);
          return;
        }
        setUrl(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [supabaseClient, songPath]);

  return url;
};
