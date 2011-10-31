class HauthproxyController < ApplicationController
  def validate
    logger.warn('Params: ' + params.inspect)
  end

  def invalid
    logger.warn('Params: ' + params.inspect)
  end
end
