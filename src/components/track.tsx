type TrackProps = {
  track: SpotifyApi.TrackObjectFull;
};

export default function Track({ track }: TrackProps) {
  return (
    <div className="flex gap-2 p-4 bg-black bg-opacity-20">
      <div>
        <img className="w-[100px] h-[100px]" src={track.album.images[0].url} alt={track.name} />
      </div>
      <div>
        <p>{track.name}</p>
        <p>{track.artists[0].name}</p>
        <p>{track.album.release_date}</p>
      </div>
    </div>
  );
}
