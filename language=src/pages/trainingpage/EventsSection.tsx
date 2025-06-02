{displayedWebinars.length === 0 ? (
  <div className="text-center py-4">
    <p className="text-gray-500">
      No upcoming webinars at the moment. Please check back later.
    </p>
  </div>
) : (
  <ul className="space-y-4 mb-6">
    {displayedWebinars.map((webinar) => {
      const status = getWebinarStatus(webinar);
      return (
        <li key={webinar.id} className="flex items-start">
          <span
            className={`${status.className} text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1`}
          >
            {status.label}
          </span>
          <div>
            <h4 className="font-semibold">{webinar.title}</h4>
            <p className="text-gray-600 text-sm">
              {formatEventDate(webinar.date)} |{" "}
              {formatTimeRange(
                webinar.start_time,
                webinar.end_time
              )}
            </p>
            <Button
              variant="text"
              size="sm"
              className="mt-1 p-0 bg-green-500 text-white"
              to={`/webinar/${webinar.id}`}
            >
              View Details <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </li>
      );
    })}
  </ul>
)} 