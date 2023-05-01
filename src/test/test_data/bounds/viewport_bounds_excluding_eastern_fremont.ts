// This Polygon represents the bounds of the map viewport, where the user has done a search for Fremont, but then
// dragged the map to the right in such a way that the eastern half of the Fremont boundary is no longer visibile. it
// can be used to test whether the search is correctly constrained by the intersection of the Fremont boundary and this
// bounds polygon in such a way that results are only returned that are within both shapes.
export default {
  type: "Polygon",
  coordinates: [
    [
      [
        -122.4055679584371,
        47.69011227856514
      ],
      [
        -122.4055679584371,
        47.62356960805306
      ],
      [
        -122.35200960882773,
        47.62356960805306
      ],
      [
        -122.35200960882773,
        47.69011227856514
      ],
      [
        -122.4055679584371,
        47.69011227856514
      ]
    ]
  ]
}
