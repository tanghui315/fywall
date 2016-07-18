var fywall = {
	version     : "1.1.7",
	downloadUrl : "http://www.fywall.info/release/fws.crx",
	faq         : [
		{
			q : "为什么我充值后账号仍然显示已到期？",
			a : "如果没有立即到账，充值后请重新登录飞岩。"
		},
		{
			q : "我想用支付宝充值怎么办？",
			a : "请用支付宝转账到feiyan_admin@126.com。备注填你的邮箱账号，客服会在5分钟内给你加上时间。"
		}
	],
	element     : {
		download : document.getElementById('download-btn'),
		version  : document.getElementById('version'),
		faq      : document.getElementById('faq')
	}
};

// Component
fywall.component = {
	download : React.createClass({
		render: function() {
			return <a href={this.props.url} id="download-button" className="button-dwnld download-desktop">下载飞岩</a>;
		}
	}),
	version : React.createClass({
		render: function(){
			return <p className="centered current-version"><span>当前版本:</span><span id="version-number">{this.props.ver}</span></p>;
		}
	}),
	faq     : React.createClass({
		render : function() {
			return (
				<div>
					{
						this.props.faq.map(function(item, i){
							return (
								<div className="question" key = {i}>
									<a href="javascript:;"><span>Q：{item.q}</span></a>
									<div className="answer">
									  <p>A：{item.a}</p>
									</div>
								</div>
							);
						})
					}
				</div>	
			)
		}
	})
};

// Render component

if(fywall.element.download){
	ReactDOM.render(
		<fywall.component.download url={fywall.downloadUrl} />,
		fywall.element.download
	);
}

if(fywall.element.version){
	ReactDOM.render(
		<fywall.component.version ver={fywall.version} />,
	  	fywall.element.version
	);
}

if(fywall.element.faq){
	ReactDOM.render(
		<fywall.component.faq faq={fywall.faq} />,
	  	fywall.element.faq
	);
}